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
    const { telegram_username } = await req.json();

    if (!telegram_username || !telegram_username.startsWith('@')) {
      return new Response(
        JSON.stringify({ error: 'Invalid username format. Must start with @' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const username = telegram_username.slice(1); // Remove @ symbol
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Rate limiting - check if user requested code recently
    const { data: recentCodes } = await supabase
      .from('verification_codes')
      .select('created_at')
      .eq('telegram_username', username)
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentCodes && recentCodes.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Please wait before requesting another code' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification code (expires in 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    const { error: dbError } = await supabase
      .from('verification_codes')
      .insert({
        telegram_username: username,
        verification_code: verificationCode,
        expires_at: expiresAt.toISOString()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate verification code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send verification code via Telegram Bot API
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const message = `🔐 Your CampusLink AI verification code is: ${verificationCode}\n\nThis code will expire in 5 minutes.`;

    try {
      // First, try to get chat ID by username
      const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: `@${username}`,
          text: message,
          parse_mode: 'HTML'
        })
      });

      const telegramResult = await telegramResponse.json();
      
      if (!telegramResult.ok) {
        console.error('Telegram API error:', telegramResult);
        
        // Clean up the verification code if we can't send it
        await supabase
          .from('verification_codes')
          .delete()
          .eq('telegram_username', username)
          .eq('verification_code', verificationCode);

        if (telegramResult.error_code === 400) {
          return new Response(
            JSON.stringify({ 
              error: 'Username not found or user has not started the bot. Please start a chat with @classSwap_notifier_bot first.' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ error: 'Failed to send verification code. Please check your username.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification code sent successfully!' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (telegramError) {
      console.error('Telegram send error:', telegramError);
      
      // Clean up the verification code if we can't send it
      await supabase
        .from('verification_codes')
        .delete()
        .eq('telegram_username', username)
        .eq('verification_code', verificationCode);

      return new Response(
        JSON.stringify({ error: 'Failed to send verification code via Telegram' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Send verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});