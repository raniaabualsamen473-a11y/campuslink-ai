import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SessionValidationRequest {
  session_token: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      const body: SessionValidationRequest = await req.json();
      const { session_token } = body;

      if (!session_token) {
        return new Response(
          JSON.stringify({ error: 'Session token required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      // Validate session token
      const { data: sessionData, error } = await supabase
        .rpc('authenticate_session', { token: session_token });

      if (error || !sessionData || sessionData.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired session' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 
          }
        );
      }

      const userProfile = sessionData[0];

      return new Response(
        JSON.stringify({ 
          success: true,
          user: {
            profile_id: userProfile.profile_id,
            telegram_user_id: userProfile.telegram_user_id,
            telegram_username: userProfile.telegram_username
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Handle logout
    if (req.method === 'DELETE') {
      const body: SessionValidationRequest = await req.json();
      const { session_token } = body;

      if (!session_token) {
        return new Response(
          JSON.stringify({ error: 'Session token required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      // Delete session
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', session_token);

      if (error) {
        console.error('Error deleting session:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to logout' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Logged out successfully' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});