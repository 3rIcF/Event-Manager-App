// Event Manager App - Suppliers API
// Supabase Edge Function for Supplier Management
// Created: 2025-08-19

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Supplier {
  id?: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  specialties: string[];
  rating?: number;
  reliability_score?: number;
  payment_terms?: string;
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
    const supplierId = pathSegments[pathSegments.length - 1]

    switch (method) {
      case 'GET':
        if (supplierId && supplierId !== 'suppliers') {
          // Get single supplier with materials and services
          const { data: supplier, error } = await supabaseClient
            .from('suppliers')
            .select(`
              *,
              materials:materials(id, name, category, unit_cost, current_stock),
              services:services(id, name, category, hourly_rate, fixed_rate)
            `)
            .eq('id', supplierId)
            .eq('is_active', true)
            .single()

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(supplier),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // Get all suppliers with optional filtering
          const { searchParams } = url
          const specialty = searchParams.get('specialty')
          const minRating = searchParams.get('minRating')
          const minReliability = searchParams.get('minReliability')

          let query = supabaseClient
            .from('suppliers')
            .select(`
              *,
              materials:materials(count),
              services:services(count)
            `)
            .eq('is_active', true)

          if (specialty) {
            query = query.contains('specialties', [specialty])
          }

          if (minRating) {
            query = query.gte('rating', minRating)
          }

          if (minReliability) {
            query = query.gte('reliability_score', minReliability)
          }

          const { data: suppliers, error } = await query
            .order('name', { ascending: true })

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(suppliers),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

      case 'POST':
        // Create new supplier
        const supplierData: Supplier = await req.json()
        
        // Validate required fields
        if (!supplierData.name) {
          return new Response(
            JSON.stringify({ error: 'Supplier name is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Validate rating range
        if (supplierData.rating !== undefined && (supplierData.rating < 0 || supplierData.rating > 5)) {
          return new Response(
            JSON.stringify({ error: 'Rating must be between 0 and 5' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Validate reliability score range
        if (supplierData.reliability_score !== undefined && (supplierData.reliability_score < 1 || supplierData.reliability_score > 10)) {
          return new Response(
            JSON.stringify({ error: 'Reliability score must be between 1 and 10' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: newSupplier, error: createError } = await supabaseClient
          .from('suppliers')
          .insert([supplierData])
          .select()
          .single()

        if (createError) {
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(newSupplier),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'PUT':
        // Update supplier
        if (!supplierId) {
          return new Response(
            JSON.stringify({ error: 'Supplier ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const updateData = await req.json()

        // Validate rating range if provided
        if (updateData.rating !== undefined && (updateData.rating < 0 || updateData.rating > 5)) {
          return new Response(
            JSON.stringify({ error: 'Rating must be between 0 and 5' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Validate reliability score range if provided
        if (updateData.reliability_score !== undefined && (updateData.reliability_score < 1 || updateData.reliability_score > 10)) {
          return new Response(
            JSON.stringify({ error: 'Reliability score must be between 1 and 10' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: updatedSupplier, error: updateError } = await supabaseClient
          .from('suppliers')
          .update(updateData)
          .eq('id', supplierId)
          .select()
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(updatedSupplier),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        // Soft delete supplier
        if (!supplierId) {
          return new Response(
            JSON.stringify({ error: 'Supplier ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if supplier has active materials or services
        const { data: activeItems, error: checkError } = await supabaseClient
          .from('materials')
          .select('id')
          .eq('supplier_id', supplierId)
          .eq('is_active', true)
          .limit(1)

        if (checkError) {
          return new Response(
            JSON.stringify({ error: checkError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (activeItems && activeItems.length > 0) {
          return new Response(
            JSON.stringify({ error: 'Cannot delete supplier with active materials. Please reassign or deactivate materials first.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error: deleteError } = await supabaseClient
          .from('suppliers')
          .update({ is_active: false })
          .eq('id', supplierId)

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Supplier deleted successfully' }),
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
