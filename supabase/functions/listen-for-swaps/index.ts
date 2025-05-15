
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Normalizes section names for consistent matching
 */
const normalizeSection = (sectionName: string): string => {
  if (!sectionName) return '';
  
  // Convert to lowercase and trim
  let normalized = sectionName.toLowerCase().trim();
  
  // Remove "section" word if present
  normalized = normalized.replace(/\bsection\s*/gi, '');
  
  // Standardize common day patterns
  // MW, M/W, Monday/Wednesday, etc. -> mw
  if (/\b(m[on]*(day)?[\s\/]*w[ed]*(nesday)?)\b/i.test(normalized)) {
    normalized = normalized.replace(/\b(m[on]*(day)?[\s\/]*w[ed]*(nesday)?)\b/i, 'mw');
  }
  
  // STT, S/T/T, Sunday/Tuesday/Thursday, etc. -> stt
  if (/\b(s[un]*(day)?[\s\/]*t[ue]*(sday)?[\s\/]*th[ur]*(sday)?)\b/i.test(normalized)) {
    normalized = normalized.replace(/\b(s[un]*(day)?[\s\/]*t[ue]*(sday)?[\s\/]*th[ur]*(sday)?)\b/i, 'stt');
  }
  
  // Standardize time formats (8:00 AM, 8 AM, 8am -> 8am)
  normalized = normalized.replace(/(\d+)(:00)?\s*(am|pm)/i, '$1$3');
  
  // Remove parentheses and their contents
  normalized = normalized.replace(/\(.*?\)/g, '');
  
  // Remove extra spaces
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Remove special characters except alphanumeric, spaces
  normalized = normalized.replace(/[^\w\s]/g, '');
  
  // Final trim
  return normalized.trim();
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
          // Apply normalization to the section names before forwarding
          const newRequest = {...payload.new};
          if (newRequest.current_section) {
            newRequest.current_section = normalizeSection(newRequest.current_section);
          }
          if (newRequest.desired_section) {
            newRequest.desired_section = normalizeSection(newRequest.desired_section);
          }
          
          // Call our forward-swap-request function with the normalized data
          const response = await fetch(`${supabaseUrl}/functions/v1/forward-swap-request`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({ record: newRequest }),
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
