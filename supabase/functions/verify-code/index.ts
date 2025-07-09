import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telegram_username, verification_code } = await req.json();

    if (!telegram_username || !verification_code) {
      return new Response(
        JSON.stringify({ error: 'Username and verification code are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const username = telegram_username.startsWith('@') ? telegram_username.slice(1) : telegram_username;
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Clean up expired codes first
    await supabase.rpc('cleanup_expired_verification_codes');

    // Find and validate verification code
    const { data: codeData, error: codeError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('telegram_username', username)
      .eq('verification_code', verification_code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (codeError || !codeData) {
      console.error('Code validation error:', codeError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired verification code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark code as used
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', codeData.id);

    // Create user session using the existing function
    const { data: sessionData, error: sessionError } = await supabase
      .rpc('create_user_session', {
        p_telegram_user_id: 0, // We don't have the actual Telegram user ID yet
        p_telegram_username: username,
        p_telegram_chat_id: 0, // We'll update this when we get the actual chat ID
        p_first_name: null,
        p_last_name: null
      });

    if (sessionError || !sessionData || sessionData.length === 0) {
      console.error('Session creation error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const session = sessionData[0];

    // Get user profile for response
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.profile_id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        session_token: session.session_token,
        profile_id: session.profile_id,
        user: profileData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verify code error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});