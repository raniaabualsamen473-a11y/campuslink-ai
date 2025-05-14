
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const N8N_WEBHOOK_URL = "https://artificialdynamo04.app.n8n.cloud/webhook-test/swap-request";

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
    const { record } = await req.json();

    if (!record || !record.id) {
      throw new Error("Missing record data");
    }

    console.log("Processing swap request:", record.id);

    // Forward the data to n8n webhook with the required format
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ record }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to forward to n8n webhook: ${response.status} ${errorText}`);
    }

    console.log("Successfully forwarded swap request to n8n:", record.id);

    return new Response(
      JSON.stringify({ success: true, message: "Swap request forwarded to n8n" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in forward-swap-request function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
