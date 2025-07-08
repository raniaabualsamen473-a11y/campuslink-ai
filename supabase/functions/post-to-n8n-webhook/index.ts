
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const N8N_WEBHOOK_URL = "https://acegrowthlo.app.n8n.cloud/webhook/swap-request";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Received payload to forward to n8n:", payload);

    // Forward the data to n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to forward to n8n webhook: ${response.status} ${errorText}`);
    }

    console.log("Successfully forwarded data to n8n webhook");

    return new Response(
      JSON.stringify({ success: true, message: "Data forwarded to n8n webhook successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in post-to-n8n-webhook function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
