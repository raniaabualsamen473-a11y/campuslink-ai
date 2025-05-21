
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "request_submitted" | "match_found" | "welcome" | "email_confirmation";
  email: string;
  name: string;
  details: {
    course?: string;
    currentSection?: string;
    targetSection?: string;
    matchedWith?: string;
    telegramUsername?: string;
    confirmationUrl?: string;
  };
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, name, details }: NotificationRequest = await req.json();

    console.log(`Processing notification type: ${type} for ${email}`);
    
    // Email content based on notification type
    let subject = "";
    let bodyHtml = "";

    if (type === "email_confirmation") {
      subject = `Verify Your Email - CampusLink`;
      bodyHtml = `
        <h1>Verify Your Email Address</h1>
        <p>Hi ${name},</p>
        <p>Thank you for creating an account with CampusLink. To complete your registration, please verify your email address by clicking the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${details.confirmationUrl}" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verify Email Address
          </a>
        </p>
        <p>If you didn't create an account with CampusLink, you can safely ignore this email.</p>
        <p>Thank you,<br>The CampusLink Team</p>
      `;
    } else if (type === "welcome") {
      subject = `Welcome to CampusLink!`;
      bodyHtml = `
        <h1>Welcome to CampusLink!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for creating an account with CampusLink. Your account has been successfully created.</p>
        <p>You can now start creating swap requests or petitions for your courses.</p>
        <p>Thank you for using CampusLink!</p>
      `;
    } else if (type === "request_submitted") {
      subject = `CampusLink: Your ${details.course} swap request has been submitted`;
      bodyHtml = `
        <h1>Your swap request has been submitted!</h1>
        <p>Hi ${name},</p>
        <p>Your request for ${details.course} has been successfully submitted.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li><strong>Course:</strong> ${details.course}</li>
          <li><strong>Current Section:</strong> ${details.currentSection || "N/A"}</li>
          <li><strong>Desired Section:</strong> ${details.targetSection || "N/A"}</li>
        </ul>
        <p>We'll notify you when we find a match for your request.</p>
        <p>Thank you for using CampusLink!</p>
      `;
    } else if (type === "match_found") {
      subject = `CampusLink: Match Found for ${details.course}!`;
      bodyHtml = `
        <h1>We've found a match for your class swap!</h1>
        <p>Hi ${name},</p>
        <p>Good news! We've found a match for your ${details.course} swap request.</p>
        <p><strong>Match Details:</strong></p>
        <ul>
          <li><strong>Course:</strong> ${details.course}</li>
          <li><strong>From Section:</strong> ${details.currentSection || "N/A"}</li>
          <li><strong>To Section:</strong> ${details.targetSection || "N/A"}</li>
        </ul>
        ${details.matchedWith ? `<p><strong>Matched with:</strong> ${details.matchedWith}</p>` : ""}
        ${details.telegramUsername ? `<p>You can contact your match via Telegram: @${details.telegramUsername}</p>` : ""}
        <p>Thank you for using CampusLink!</p>
      `;
    }

    // Send the email using our send-email function
    const emailResponse = await supabase.functions.invoke("send-email", {
      body: {
        to: email,
        subject: subject,
        html: bodyHtml,
      }
    });

    // Check for errors in the response
    if (emailResponse.error) {
      console.error("Error sending email:", emailResponse.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: emailResponse.error 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification processed successfully",
        emailSubject: subject
      }),
      {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
