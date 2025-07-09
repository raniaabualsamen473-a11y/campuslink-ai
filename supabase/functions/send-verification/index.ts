import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Send verification function called:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Parsing request body...');
    const body = await req.json();
    console.log('Request body:', body);
    
    const { telegram_username } = body;

    if (!telegram_username || !telegram_username.startsWith('@')) {
      console.log('Invalid username format:', telegram_username);
      return new Response(
        JSON.stringify({ error: 'Invalid username format. Must start with @' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const username = telegram_username.slice(1); // Remove @ symbol
    console.log('Processing username:', username);
    
    console.log('Initializing Supabase client...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    console.log('Environment check:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseKey,
      urlStart: supabaseUrl?.substring(0, 20) + '...'
    });
    
    const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '');

    // Rate limiting - check if user requested code recently
    console.log('Checking rate limiting for username:', username);
    const { data: recentCodes, error: rateCheckError } = await supabase
      .from('verification_codes')
      .select('created_at')
      .eq('telegram_username', username)
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute
      .order('created_at', { ascending: false })
      .limit(1);

    if (rateCheckError) {
      console.error('Rate check error:', rateCheckError);
    }
    
    console.log('Recent codes found:', recentCodes?.length || 0);

    if (recentCodes && recentCodes.length > 0) {
      console.log('Rate limit hit for username:', username);
      return new Response(
        JSON.stringify({ error: 'Please wait before requesting another code' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit verification code
    console.log('Generating verification code...');
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated code for username:', username);
    
    // Store verification code (expires in 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    console.log('Storing verification code in database...');
    
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
    
    console.log('Verification code stored successfully');

    // Send verification code via Telegram Bot API
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    console.log('Bot token check:', { 
      hasToken: !!botToken, 
      tokenStart: botToken?.substring(0, 10) + '...'
    });
    
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN environment variable not set');
      return new Response(
        JSON.stringify({ error: 'Bot configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const message = `🔐 Your CampusLink AI verification code is: ${verificationCode}\n\nThis code will expire in 5 minutes.`;
    console.log('Preparing to send message to @' + username);

    try {
      // Send message via Telegram Bot API
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const payload = {
        chat_id: `@${username}`,
        text: message,
        parse_mode: 'HTML'
      };
      
      console.log('Sending Telegram API request:', {
        url: telegramUrl.replace(botToken, 'BOT_TOKEN_HIDDEN'),
        payload: { ...payload, text: 'MESSAGE_HIDDEN' }
      });
      
      const telegramResponse = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('Telegram API response status:', telegramResponse.status);
      const telegramResult = await telegramResponse.json();
      console.log('Telegram API response:', telegramResult);
      
      if (!telegramResult.ok) {
        console.error('Telegram API error details:', {
          ok: telegramResult.ok,
          error_code: telegramResult.error_code,
          description: telegramResult.description
        });
        
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