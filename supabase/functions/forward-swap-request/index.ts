
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Same normalization function we added to listen-for-swaps
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

  try {
    const { record } = await req.json();

    if (!record || !record.id) {
      throw new Error("Missing record data");
    }

    console.log("Processing swap request:", record.id);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find potential matches for this swap request
    let query = supabase
      .from('swap_requests')
      .select('*')
      .eq('desired_course', record.desired_course)
      .neq('user_id', record.user_id) // Don't match with self
      .neq('id', record.id); // Don't match with the same request
    
    // Add semester type filtering to prevent cross-semester matching
    if (record.summer_format) {
      // If current request is summer semester, only match with other summer requests
      query = query.not('summer_format', 'is', null);
    } else {
      // If current request is regular semester, only match with other regular requests
      query = query.is('summer_format', null);
    }
    
    const { data: potentialMatches, error: matchError } = await query;

    if (matchError) {
      console.error("Error finding potential matches:", matchError);
      throw new Error(`Failed to find matches: ${matchError.message}`);
    }

    console.log(`Found ${potentialMatches?.length || 0} potential matches for request ${record.id}`);

    // Check for mutual matches (User A wants User B's section AND User B wants User A's section)
    const matches = [];
    if (potentialMatches && potentialMatches.length > 0) {
      for (const potentialMatch of potentialMatches) {
        // Check if it's a mutual match using normalized sections
        const isMatch = (
          normalizeSection(record.normalized_desired_section || record.desired_section || '') === 
          normalizeSection(potentialMatch.normalized_current_section || potentialMatch.current_section || '')
        ) && (
          normalizeSection(record.normalized_current_section || record.current_section || '') === 
          normalizeSection(potentialMatch.normalized_desired_section || potentialMatch.desired_section || '')
        );

        if (isMatch) {
          matches.push(potentialMatch);
          console.log(`Found mutual match: ${record.id} <-> ${potentialMatch.id}`);
        }
      }
    }

    // If matches found, call match-notification-webhook
    if (matches.length > 0) {
      console.log(`Processing ${matches.length} matches for request ${record.id}`);
      
      for (const match of matches) {
        try {
          // Call match-notification-webhook function internally
          const notificationResponse = await supabase.functions.invoke('match-notification-webhook', {
            body: {
              request_a_id: record.id,
              request_b_id: match.id
            }
          });

          if (notificationResponse.error) {
            console.error("Error calling match-notification-webhook:", notificationResponse.error);
          } else {
            console.log("Successfully triggered match notification for:", record.id, "<->", match.id);
          }
        } catch (notifyError) {
          console.error("Error triggering notification:", notifyError);
        }
      }
    } else {
      console.log("No matches found for request:", record.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Swap request processed successfully",
        matchesFound: matches.length,
        requestId: record.id
      }),
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
