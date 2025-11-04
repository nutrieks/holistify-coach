import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
}

interface WebhookPayload {
  user: {
    email: string;
    id: string;
  };
  email_data: EmailData;
}

const getEmailSubject = (actionType: string): string => {
  switch (actionType) {
    case "signup":
      return "Potvrdite svoju registraciju - Holistic Health Coach";
    case "recovery":
      return "Resetirajte lozinku - Holistic Health Coach";
    case "email_change":
      return "Potvrdite promjenu email adrese - Holistic Health Coach";
    default:
      return "Poruka od Holistic Health Coach";
  }
};

const generateEmailHTML = (
  actionType: string,
  token: string,
  tokenHash: string,
  redirectTo: string,
  supabaseUrl: string,
  userName: string
): string => {
  const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=${actionType}&redirect_to=${redirectTo}`;

  switch (actionType) {
    case "signup":
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
              }
              .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              h1 {
                color: #2563eb;
                font-size: 28px;
                margin-bottom: 10px;
              }
              .content {
                margin-bottom: 30px;
              }
              .button {
                display: inline-block;
                background-color: #2563eb;
                color: #ffffff !important;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 6px;
                font-weight: 600;
                text-align: center;
                margin: 20px 0;
              }
              .button:hover {
                background-color: #1d4ed8;
              }
              .code-box {
                background-color: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 16px;
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 2px;
                margin: 20px 0;
                color: #1f2937;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
                text-align: center;
              }
              .warning {
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 12px;
                margin: 20px 0;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌿 Dobrodošli!</h1>
              </div>
              
              <div class="content">
                <p>Pozdrav,</p>
                <p>Hvala što ste se registrirali na <strong>Holistic Health Coach</strong> platformu!</p>
                <p>Molimo vas da potvrdite svoju email adresu klikom na gumb ispod:</p>
                
                <div style="text-align: center;">
                  <a href="${confirmationUrl}" class="button">
                    Potvrdi Email Adresu
                  </a>
                </div>
                
                <p>Ili kopirajte i zalijepite ovaj kod za potvrdu:</p>
                
                <div class="code-box">
                  ${token}
                </div>
                
                <div class="warning">
                  <strong>⚠️ Važno:</strong> Ako niste vi tražili ovu registraciju, možete slobodno ignorirati ovaj email.
                </div>
                
                <p>Link za potvrdu je valjan sljedećih 24 sata.</p>
              </div>
              
              <div class="footer">
                <p>© 2024 Holistic Health Coach - Platforma za holistično zdravlje</p>
                <p>Ova poruka je poslana na ${userName}</p>
              </div>
            </div>
          </body>
        </html>
      `;

    case "recovery":
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
              }
              .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              h1 {
                color: #dc2626;
                font-size: 28px;
                margin-bottom: 10px;
              }
              .content {
                margin-bottom: 30px;
              }
              .button {
                display: inline-block;
                background-color: #dc2626;
                color: #ffffff !important;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 6px;
                font-weight: 600;
                text-align: center;
                margin: 20px 0;
              }
              .button:hover {
                background-color: #b91c1c;
              }
              .code-box {
                background-color: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 6px;
                padding: 16px;
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 2px;
                margin: 20px 0;
                color: #991b1b;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
                text-align: center;
              }
              .warning {
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 12px;
                margin: 20px 0;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Resetiranje Lozinke</h1>
              </div>
              
              <div class="content">
                <p>Pozdrav,</p>
                <p>Primili smo zahtjev za resetiranje lozinke vašeg računa na <strong>Holistic Health Coach</strong> platformi.</p>
                <p>Kliknite na gumb ispod za resetiranje lozinke:</p>
                
                <div style="text-align: center;">
                  <a href="${confirmationUrl}" class="button">
                    Resetiraj Lozinku
                  </a>
                </div>
                
                <p>Ili kopirajte i zalijepite ovaj kod:</p>
                
                <div class="code-box">
                  ${token}
                </div>
                
                <div class="warning">
                  <strong>⚠️ Važno:</strong> Ako niste vi tražili resetiranje lozinke, molimo vas da odmah promijenite lozinku i kontaktirate podršku.
                </div>
                
                <p>Link za resetiranje je valjan sljedećih 60 minuta.</p>
              </div>
              
              <div class="footer">
                <p>© 2024 Holistic Health Coach - Platforma za holistično zdravlje</p>
                <p>Ova poruka je poslana na ${userName}</p>
              </div>
            </div>
          </body>
        </html>
      `;

    case "email_change":
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
              }
              .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              h1 {
                color: #059669;
                font-size: 28px;
                margin-bottom: 10px;
              }
              .content {
                margin-bottom: 30px;
              }
              .button {
                display: inline-block;
                background-color: #059669;
                color: #ffffff !important;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 6px;
                font-weight: 600;
                text-align: center;
                margin: 20px 0;
              }
              .button:hover {
                background-color: #047857;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📧 Potvrda Promjene Email Adrese</h1>
              </div>
              
              <div class="content">
                <p>Pozdrav,</p>
                <p>Primili smo zahtjev za promjenu email adrese vašeg računa.</p>
                <p>Kliknite na gumb ispod za potvrdu nove email adrese:</p>
                
                <div style="text-align: center;">
                  <a href="${confirmationUrl}" class="button">
                    Potvrdi Novu Email Adresu
                  </a>
                </div>
              </div>
              
              <div class="footer">
                <p>© 2024 Holistic Health Coach - Platforma za holistično zdravlje</p>
                <p>Ova poruka je poslana na ${userName}</p>
              </div>
            </div>
          </body>
        </html>
      `;

    default:
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body>
            <p>Kliknite <a href="${confirmationUrl}">ovdje</a> za nastavak.</p>
          </body>
        </html>
      `;
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received email webhook request");
    
    const payload: WebhookPayload = await req.json();
    console.log("Payload received:", { 
      email: payload.user.email, 
      actionType: payload.email_data.email_action_type 
    });

    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = payload;

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";

    // Generate HTML email content
    const htmlContent = generateEmailHTML(
      email_action_type,
      token,
      token_hash,
      redirect_to,
      supabaseUrl,
      user.email
    );

    console.log("Sending email via Resend to:", user.email);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "NutriEkspert <noreply@notifications.nutriekspert.com>",
      to: [user.email],
      subject: getEmailSubject(email_action_type),
      html: htmlContent,
    });

    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      throw emailResponse.error;
    }

    console.log("Email sent successfully:", emailResponse.data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send email",
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
