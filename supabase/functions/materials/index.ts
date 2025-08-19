// Event Manager App - Materials API
// Supabase Edge Function for Materials Management
// Created: 2025-08-19

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Material {
  id?: string;
  name: string;
  category: string;
  description?: string;
  unit: string;
  unit_cost: number;
  supplier_id?: string;
  min_stock_level: number;
  current_stock: number;
  location?: string;
}

interface ProjectMaterial {
  id?: string;
  project_id: string;
  material_id: string;
  quantity_required: number;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost?: number;
  total_cost?: number;
  order_date?: string;
  delivery_date?: string;
  status: string;
  notes?: string;
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
    const materialId = pathSegments[pathSegments.length - 1]

    switch (method) {
      case 'GET':
        if (materialId && materialId !== 'materials') {
          // Get single material with supplier info
          const { data: material, error } = await supabaseClient
            .from('materials')
            .select(`
              *,
              supplier:suppliers(id, name, contact_person, email, phone, rating)
            `)
            .eq('id', materialId)
            .eq('is_active', true)
            .single()

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(material),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // Get all materials with optional filtering
          const { searchParams } = url
          const category = searchParams.get('category')
          const supplier = searchParams.get('supplier')
          const lowStock = searchParams.get('lowStock') === 'true'

          let query = supabaseClient
            .from('materials')
            .select(`
              *,
              supplier:suppliers(id, name, contact_person, email, phone, rating)
            `)
            .eq('is_active', true)

          if (category) {
            query = query.eq('category', category)
          }

          if (supplier) {
            query = query.eq('supplier_id', supplier)
          }

          if (lowStock) {
            query = query.lt('current_stock', 'min_stock_level')
          }

          const { data: materials, error } = await query
            .order('name', { ascending: true })

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(materials),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

      case 'POST':
        // Create new material
        const materialData: Material = await req.json()
        
        // Validate required fields
        if (!materialData.name || !materialData.category || !materialData.unit || materialData.unit_cost === undefined) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: name, category, unit, unit_cost' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: newMaterial, error: createError } = await supabaseClient
          .from('materials')
          .insert([materialData])
          .select(`
            *,
            supplier:suppliers(id, name, contact_person, email, phone, rating)
          `)
          .single()

        if (createError) {
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(newMaterial),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'PUT':
        // Update material
        if (!materialId) {
          return new Response(
            JSON.stringify({ error: 'Material ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const updateData = await req.json()
        const { data: updatedMaterial, error: updateError } = await supabaseClient
          .from('materials')
          .update(updateData)
          .eq('id', materialId)
          .select(`
            *,
            supplier:suppliers(id, name, contact_person, email, phone, rating)
          `)
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(updatedMaterial),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        // Soft delete material
        if (!materialId) {
          return new Response(
            JSON.stringify({ error: 'Material ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error: deleteError } = await supabaseClient
          .from('materials')
          .update({ is_active: false })
          .eq('id', materialId)

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Material deleted successfully' }),
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
