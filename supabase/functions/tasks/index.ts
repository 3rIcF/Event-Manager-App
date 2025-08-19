// Event Manager App - Tasks API
// Supabase Edge Function for Task Management
// Created: 2025-08-19

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Task {
  id?: string;
  project_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  dependencies: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { method } = req
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const taskId = pathSegments[pathSegments.length - 1]

    switch (method) {
      case 'GET':
        if (taskId && taskId !== 'tasks') {
          // Get single task with assignee and project info
          const { data: task, error } = await supabaseClient
            .from('tasks')
            .select(`
              *,
              assigned_user:users!tasks_assigned_to_fkey(id, full_name, email),
              project:projects(id, name, status)
            `)
            .eq('id', taskId)
            .eq('is_active', true)
            .single()

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(task),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // Get all tasks with optional filtering
          const { searchParams } = url
          const projectId = searchParams.get('projectId')
          const status = searchParams.get('status')
          const priority = searchParams.get('priority')
          const assignedTo = searchParams.get('assignedTo')
          const dueDate = searchParams.get('dueDate')

          let query = supabaseClient
            .from('tasks')
            .select(`
              *,
              assigned_user:users!tasks_assigned_to_fkey(id, full_name, email),
              project:projects(id, name, status)
            `)
            .eq('is_active', true)

          if (projectId) {
            query = query.eq('project_id', projectId)
          }

          if (status) {
            query = query.eq('status', status)
          }

          if (priority) {
            query = query.eq('priority', priority)
          }

          if (assignedTo) {
            query = query.eq('assigned_to', assignedTo)
          }

          if (dueDate) {
            query = query.eq('due_date', dueDate)
          }

          const { data: tasks, error } = await query
            .order('due_date', { ascending: true, nullsLast: true })
            .order('priority', { ascending: false })

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(tasks),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

      case 'POST':
        // Create new task
        const taskData: Task = await req.json()
        
        // Validate required fields
        if (!taskData.project_id || !taskData.title || !taskData.status || !taskData.priority) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: project_id, title, status, priority' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Validate status values
        const validStatuses = ['pending', 'in-progress', 'review', 'completed', 'cancelled']
        if (!validStatuses.includes(taskData.status)) {
          return new Response(
            JSON.stringify({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Validate priority values
        const validPriorities = ['low', 'medium', 'high', 'critical']
        if (!validPriorities.includes(taskData.priority)) {
          return new Response(
            JSON.stringify({ error: 'Invalid priority. Must be one of: ' + validPriorities.join(', ') }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if project exists and user has access
        const { data: project, error: projectError } = await supabaseClient
          .from('projects')
          .select('id, created_by')
          .eq('id', taskData.project_id)
          .eq('is_active', true)
          .single()

        if (projectError || !project) {
          return new Response(
            JSON.stringify({ error: 'Project not found or access denied' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if user can assign to specified user (basic permission check)
        if (taskData.assigned_to && taskData.assigned_to !== user.id) {
          // In a real app, check if user has permission to assign tasks to others
          const { data: assignee, error: assigneeError } = await supabaseClient
            .from('users')
            .select('id, role')
            .eq('id', taskData.assigned_to)
            .eq('is_active', true)
            .single()

          if (assigneeError || !assignee) {
            return new Response(
              JSON.stringify({ error: 'Invalid assignee' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }

        const { data: newTask, error: createError } = await supabaseClient
          .from('tasks')
          .insert([taskData])
          .select(`
            *,
            assigned_user:users!tasks_assigned_to_fkey(id, full_name, email),
            project:projects(id, name, status)
          `)
          .single()

        if (createError) {
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(newTask),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'PUT':
        // Update task
        if (!taskId) {
          return new Response(
            JSON.stringify({ error: 'Task ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const updateData = await req.json()

        // Validate status if provided
        if (updateData.status && !['pending', 'in-progress', 'review', 'completed', 'cancelled'].includes(updateData.status)) {
          return new Response(
            JSON.stringify({ error: 'Invalid status value' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Validate priority if provided
        if (updateData.priority && !['low', 'medium', 'high', 'critical'].includes(updateData.priority)) {
          return new Response(
            JSON.stringify({ error: 'Invalid priority value' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: updatedTask, error: updateError } = await supabaseClient
          .from('tasks')
          .update(updateData)
          .eq('id', taskId)
          .select(`
            *,
            assigned_user:users!tasks_assigned_to_fkey(id, full_name, email),
            project:projects(id, name, status)
          `)
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(updatedTask),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        // Soft delete task
        if (!taskId) {
          return new Response(
            JSON.stringify({ error: 'Task ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error: deleteError } = await supabaseClient
          .from('tasks')
          .update({ is_active: false })
          .eq('id', taskId)

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Task deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
