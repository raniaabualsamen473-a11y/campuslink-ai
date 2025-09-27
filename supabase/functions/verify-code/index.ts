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

    // Input validation for verification code
    if (!/^\d{6}$/.test(verification_code)) {
      console.error('Invalid verification code format:', verification_code);
      return new Response(
        JSON.stringify({ error: 'Verification code must be exactly 6 digits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find and validate verification code - use maybeSingle to handle missing records gracefully
    const { data: codeData, error: codeError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('telegram_username', username)
      .eq('verification_code', verification_code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (codeError) {
      console.error('Database error during code validation:', codeError);
      return new Response(
        JSON.stringify({ error: 'Database error occurred. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!codeData) {
      console.error('Code validation failed for username:', username, 'code:', verification_code);
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

    // Get chat_id from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('telegram_chat_id, telegram_user_id, first_name, last_name')
      .eq('telegram_username', username)
      .single();

    if (profileError || !profileData) {
      console.error('Profile not found for username:', username, profileError);
      return new Response(
        JSON.stringify({ error: 'Please send /start to the bot first to link your account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user session using the existing function
    const { data: sessionData, error: sessionError } = await supabase
      .rpc('create_user_session', {
        p_telegram_user_id: profileData.telegram_user_id || 0,
        p_telegram_username: username,
        p_telegram_chat_id: profileData.telegram_chat_id,
        p_first_name: profileData.first_name,
        p_last_name: profileData.last_name
      });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user session. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!sessionData || sessionData.length === 0) {
      console.error('No session data returned from create_user_session function');
      return new Response(
        JSON.stringify({ error: 'Session creation failed. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const session = sessionData[0];

    // Get user profile for response
    const { data: userProfileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.profile_id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        session_token: session.session_token,
        profile_id: session.profile_id,
        user: userProfileData
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