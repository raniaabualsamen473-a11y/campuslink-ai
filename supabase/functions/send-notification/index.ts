
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "request_submitted" | "match_found";
  email: string;
  name: string;
  details: {
    course?: string;
    currentSection?: string;
    targetSection?: string;
    matchedWith?: string;
    telegramUsername?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, name, details }: NotificationRequest = await req.json();

    // In a real implementation, you would integrate with an email service
    console.log(`Email notification would be sent to: ${email}`);
    console.log(`Type: ${type}`);
    console.log(`Details:`, details);

    // Email content based on notification type
    let subject = "";
    let bodyHtml = "";

    if (type === "request_submitted") {
      subject = `ClassSwap: Your ${details.course} swap request has been submitted`;
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
        <p>Thank you for using ClassSwap!</p>
      `;
    } else if (type === "match_found") {
      subject = `ClassSwap: Match Found for ${details.course}!`;
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
        <p>Thank you for using ClassSwap!</p>
      `;
    }

    // You would implement actual email sending here with a service like Resend, SendGrid, etc.
    /*
    Example with SendGrid:
    const emailResponse = await sgMail.send({
      to: email,
      from: "noreply@yourapp.com",
      subject: subject,
      html: bodyHtml,
    });
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification processed successfully",
        emailSubject: subject,
        emailBody: bodyHtml
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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
