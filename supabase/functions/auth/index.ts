// Event Manager App - Authentication API
// Supabase Edge Function for User Management & Authentication
// Created: 2025-08-19

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface User {
  id?: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'user';
  permissions: Record<string, any>;
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

    const { method } = req
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const userId = pathSegments[pathSegments.length - 1]

    switch (method) {
      case 'GET':
        if (userId && userId !== 'auth') {
          // Get user profile (requires authentication)
          const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
          if (userError || !user) {
            return new Response(
              JSON.stringify({ error: 'Unauthorized' }),
              { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Check if user is requesting their own profile or has admin rights
          if (userId !== user.id) {
            const { data: currentUser } = await supabaseClient
              .from('users')
              .select('role')
              .eq('id', user.id)
              .single()

            if (currentUser?.role !== 'admin') {
              return new Response(
                JSON.stringify({ error: 'Insufficient permissions' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }
          }

          const { data: userProfile, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', userId)
            .eq('is_active', true)
            .single()

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(userProfile),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // Get current user profile
          const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
          if (userError || !user) {
            return new Response(
              JSON.stringify({ error: 'Unauthorized' }),
              { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          const { data: userProfile, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', user.id)
            .eq('is_active', true)
            .single()

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(userProfile),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

      case 'POST':
        // Create new user (admin only)
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if user has admin role
        const { data: currentUser } = await supabaseClient
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (currentUser?.role !== 'admin') {
          return new Response(
            JSON.stringify({ error: 'Admin access required' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const userData: User = await req.json()
        
        // Validate required fields
        if (!userData.email || !userData.full_name || !userData.role) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: email, full_name, role' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Validate role
        if (!['admin', 'manager', 'user'].includes(userData.role)) {
          return new Response(
            JSON.stringify({ error: 'Invalid role. Must be admin, manager, or user' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if email already exists
        const { data: existingUser } = await supabaseClient
          .from('users')
          .select('id')
          .eq('email', userData.email)
          .eq('is_active', true)
          .single()

        if (existingUser) {
          return new Response(
            JSON.stringify({ error: 'Email already exists' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: newUser, error: createError } = await supabaseClient
          .from('users')
          .insert([userData])
          .select()
          .single()

        if (createError) {
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(newUser),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'PUT':
        // Update user profile
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: { user: updateUser }, error: updateUserError } = await supabaseClient.auth.getUser()
        if (updateUserError || !updateUser) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if user is updating their own profile or has admin rights
        if (userId !== updateUser.id) {
          const { data: currentUser } = await supabaseClient
            .from('users')
            .select('role')
            .eq('id', updateUser.id)
            .single()

          if (currentUser?.role !== 'admin') {
            return new Response(
              JSON.stringify({ error: 'Insufficient permissions' }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }

        const updateData = await req.json()

        // Validate role if provided
        if (updateData.role && !['admin', 'manager', 'user'].includes(updateData.role)) {
          return new Response(
            JSON.stringify({ error: 'Invalid role value' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: updatedUser, error: updateError } = await supabaseClient
          .from('users')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(updatedUser),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        // Soft delete user (admin only)
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: { user: deleteUser }, error: deleteUserError } = await supabaseClient.auth.getUser()
        if (deleteUserError || !deleteUser) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if user has admin role
        const { data: deleteCurrentUser } = await supabaseClient
          .from('users')
          .select('role')
          .eq('id', deleteUser.id)
          .single()

        if (deleteCurrentUser?.role !== 'admin') {
          return new Response(
            JSON.stringify({ error: 'Admin access required' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Prevent admin from deleting themselves
        if (userId === deleteUser.id) {
          return new Response(
            JSON.stringify({ error: 'Cannot delete your own account' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error: deleteError } = await supabaseClient
          .from('users')
          .update({ is_active: false })
          .eq('id', userId)

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ message: 'User deleted successfully' }),
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
