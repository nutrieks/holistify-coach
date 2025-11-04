import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData?.role !== 'admin') {
      console.error('Role check failed:', roleError)
      throw new Error('Only admins can create client accounts')
    }

    // Parse request body
    const { 
      clientName, 
      clientEmail, 
      tempPassword,
      contractStartDate,
      contractEndDate,
      questionnaireId,
      createNAQ,
      coachId
    } = await req.json()

    console.log('Creating client account:', { clientName, clientEmail })

    // Validate required fields
    if (!clientName || !clientEmail || !tempPassword) {
      throw new Error('Missing required fields: clientName, clientEmail, or tempPassword')
    }

    // Create user account using admin API (doesn't log them in)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: clientEmail,
      password: tempPassword,
      email_confirm: false, // Enable email confirmation flow to trigger webhook
      user_metadata: {
        full_name: clientName,
        role: 'client'
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      throw createError
    }

    if (!newUser.user) {
      throw new Error('Failed to create user account')
    }

    console.log('User created successfully:', newUser.user.id)

    // Handle NAQ questionnaire creation if requested
    let finalQuestionnaireId = questionnaireId

    if (createNAQ && coachId) {
      try {
        const { data: naqData, error: naqError } = await supabaseAdmin.functions.invoke('create-naq-questionnaire', {
          body: { coachId }
        })

        if (naqError) {
          console.warn('Failed to create NAQ questionnaire:', naqError)
        } else if (naqData?.questionnaireId) {
          finalQuestionnaireId = naqData.questionnaireId
          console.log('NAQ questionnaire created:', finalQuestionnaireId)
        }
      } catch (naqError) {
        console.warn('Error invoking NAQ creation:', naqError)
      }
    }

    // Insert client record
    const { error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        user_id: newUser.user.id,
        full_name: clientName,
        email: clientEmail,
        contract_start_date: contractStartDate || null,
        contract_end_date: contractEndDate || null
      })

    if (clientError) {
      console.error('Error creating client record:', clientError)
      throw clientError
    }

    console.log('Client record created successfully')

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        userId: newUser.user.id,
        message: 'Client account created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-client-account function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
