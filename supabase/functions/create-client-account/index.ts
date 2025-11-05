import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'
import { Resend } from 'npm:resend@2.0.0'

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
      contractStartDate,
      contractEndDate,
      questionnaireId,
      createNAQ,
      coachId,
      redirectUrl
    } = await req.json()

    console.log('Creating client account:', { clientName, clientEmail })

    // Validate required fields
    if (!clientName || !clientEmail) {
      throw new Error('Missing required fields: clientName or clientEmail')
    }

    // Get origin for redirect URL
    const origin = req.headers.get('origin') || redirectUrl || Deno.env.get('SUPABASE_URL')
    const redirectTo = `${origin}/auth`

    console.log('Creating user account with redirectTo:', redirectTo)

    // Create user directly with confirmed email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: clientEmail,
      email_confirm: true,
      user_metadata: {
        full_name: clientName,
        role: 'client'
      }
    })

    if (userError) {
      console.error('Error creating user:', userError)
      throw userError
    }

    if (!userData.user) {
      throw new Error('Failed to create user')
    }

    const invitedUserId = userData.user.id
    console.log('User created successfully:', invitedUserId)

    // Generate password reset link for the new user
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: clientEmail,
      options: {
        redirectTo
      }
    })

    if (resetError) {
      console.error('Error generating password reset link:', resetError)
      throw resetError
    }

    if (!resetData.properties?.action_link) {
      throw new Error('Failed to generate password reset link')
    }

    const actionLink = resetData.properties.action_link
    console.log('Password reset link generated for user:', invitedUserId)

    // Send invitation email using Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    
    try {
      const { error: emailError } = await resend.emails.send({
        from: 'Nutri Ekspert <noreply@notifications.nutriekspert.com>',
        to: [clientEmail],
        subject: 'Dobrodošli - Postavite Vašu Lozinku',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Pozdrav ${clientName},</h2>
            <p style="color: #555; line-height: 1.6;">
              Dobrodošli u našu aplikaciju za coaching! Vaš coach je kreirao račun za Vas. Kliknite na dugme ispod da biste postavili svoju lozinku i pristupili aplikaciji.
            </p>
            <p style="margin: 30px 0;">
              <a href="${actionLink}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Postavite Vašu Lozinku
              </a>
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Ukoliko ne možete kliknuti na gumb, kopirajte i zalijepite ovaj link u Vaš preglednik:
            </p>
            <p style="color: #999; font-size: 12px; word-break: break-all;">
              ${actionLink}
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px;">
              Ako niste očekivali ovaj email, možete ga ignorirati.
            </p>
          </div>
        `
      })

      if (emailError) {
        console.error('Error sending password setup email:', emailError)
        throw new Error('Failed to send password setup email')
      }

      console.log('Password setup email sent successfully to:', clientEmail)
    } catch (emailError) {
      console.error('Resend error:', emailError)
      throw new Error('Failed to send invitation email')
    }

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
        user_id: invitedUserId,
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
        userId: invitedUserId,
        message: 'Client account created and password setup email sent successfully'
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
