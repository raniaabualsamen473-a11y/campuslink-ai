
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
    // For now, we'll log the email details
    console.log(`Email notification would be sent to: ${email}`);
    console.log(`Type: ${type}`);
    console.log(`Details:`, details);

    // You would implement actual email sending here with a service like Resend, SendGrid, etc.
    // Example placeholder for future implementation:
    /*
    if (type === "request_submitted") {
      // Send request confirmation email
    } else if (type === "match_found") {
      // Send match notification email
    }
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification processed successfully" 
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
