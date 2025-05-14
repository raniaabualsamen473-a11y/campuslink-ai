
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  // Create a websocket connection to listen for database changes
  const channel = supabase.channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'swap_requests',
      },
      async (payload) => {
        console.log('New swap request detected:', payload.new);
        
        try {
          // Call our forward-swap-request function with the new row data
          const response = await fetch(`${supabaseUrl}/functions/v1/forward-swap-request`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({ record: payload.new }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to forward swap request: ${response.status} ${errorText}`);
          } else {
            console.log('Successfully forwarded swap request to n8n webhook');
          }
        } catch (error) {
          console.error('Error forwarding swap request:', error);
        }
      }
    )
    .subscribe();

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: "Listening for swap requests" 
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
