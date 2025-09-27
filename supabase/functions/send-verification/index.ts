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
    // Test bot token first with getMe endpoint
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN environment variable not found');
      return new Response(
        JSON.stringify({ error: 'Bot token configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Testing bot token with getMe endpoint...');
    
    let botUsername = 'classSwap_notifier_bot'; // fallback
    
    try {
      const getMeUrl = `https://api.telegram.org/bot${botToken}/getMe`;
      console.log('Testing bot API with URL:', getMeUrl.replace(botToken, 'BOT_TOKEN_HIDDEN'));
      
      const getMeResponse = await fetch(getMeUrl);
      const getMeResult = await getMeResponse.json();
      
      console.log('getMe API response:', {
        status: getMeResponse.status,
        ok: getMeResult.ok,
        result: getMeResult.result ? { 
          id: getMeResult.result.id, 
          username: getMeResult.result.username,
          first_name: getMeResult.result.first_name
        } : null,
        error: getMeResult.error_code ? {
          code: getMeResult.error_code,
          description: getMeResult.description
        } : null
      });
      
      if (!getMeResult.ok) {
        console.error('Bot token test failed:', getMeResult);
        return new Response(
          JSON.stringify({ error: 'Bot token is invalid or bot is not working' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      botUsername = getMeResult.result.username || 'classSwap_notifier_bot';
      console.log('Bot token test successful, bot username:', botUsername);
    } catch (botTestError) {
      console.error('Bot token test error:', botTestError);
      return new Response(
        JSON.stringify({ error: 'Failed to test bot connection' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parsing request body...');
    const body = await req.json();
    console.log('Request body received:', body);
    
    const { telegram_username } = body;
    console.log('Extracted telegram_username:', telegram_username);

    // Validate username format
    if (!telegram_username) {
      console.log('No telegram_username provided');
      return new Response(
        JSON.stringify({ error: 'Telegram username is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!telegram_username.startsWith('@')) {
      console.log('Invalid username format, missing @:', telegram_username);
      return new Response(
        JSON.stringify({ error: 'Username must start with @' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const username = telegram_username.slice(1); // Remove @ symbol
    console.log('Processed username (without @):', username);
    
    // Additional username validation
    if (username.length < 5 || username.length > 32) {
      console.log('Username length invalid:', username.length);
      return new Response(
        JSON.stringify({ error: 'Username must be between 5 and 32 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for valid username characters
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      console.log('Username contains invalid characters:', username);
      return new Response(
        JSON.stringify({ error: 'Username can only contain letters, numbers, and underscores' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Initializing Supabase client...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    console.log('Environment check:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseKey,
      urlStart: supabaseUrl?.substring(0, 30) + '...'
    });
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Database configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query profiles table to get telegram_chat_id for the username
    console.log('Looking up profile for username:', username);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('telegram_chat_id, telegram_user_id')
      .eq('telegram_username', username)
      .single();

    if (profileError || !profileData) {
      console.log('Profile not found for username:', username, profileError);
      return new Response(
        JSON.stringify({ 
          error: `Username @${username} not found. Please send /start to @${botUsername} first to register your account.`,
          botUsername: botUsername,
          needsRegistration: true
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const chatId = Number(profileData.telegram_chat_id);
    console.log('Found profile with chat_id:', chatId, 'Type:', typeof chatId);

    if (!chatId || isNaN(chatId)) {
      console.log('Invalid or missing chat_id for username:', username, 'Raw value:', profileData.telegram_chat_id);
      return new Response(
        JSON.stringify({ 
          error: `No valid chat ID found for @${username}. Please send /start to @${botUsername} first to complete your registration.`,
          botUsername: botUsername,
          needsRegistration: true,
          debug: { 
            rawChatId: profileData.telegram_chat_id, 
            convertedChatId: chatId, 
            isNaN: isNaN(chatId) 
          }
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test database connection by checking verification_codes table
    console.log('Testing database connection...');
    try {
      const { data: tableTest, error: tableError } = await supabase
        .from('verification_codes')
        .select('id')
        .limit(1);
      
      console.log('Database table test result:', {
        success: !tableError,
        error: tableError ? {
          code: tableError.code,
          message: tableError.message,
          details: tableError.details
        } : null
      });
      
      if (tableError) {
        console.error('Database table access error:', tableError);
        return new Response(
          JSON.stringify({ error: 'Database table not accessible' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (dbTestError) {
      console.error('Database connection test failed:', dbTestError);
      return new Response(
        JSON.stringify({ error: 'Database connection failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting - check if user requested code recently (within 90 seconds for better UX)
    console.log('Checking rate limiting for username:', username);
    const { data: recentCodes, error: rateCheckError } = await supabase
      .from('verification_codes')
      .select('created_at')
      .eq('telegram_username', username)
      .gte('created_at', new Date(Date.now() - 90000).toISOString()) // Last 90 seconds
      .order('created_at', { ascending: false })
      .limit(1);

    if (rateCheckError) {
      console.error('Rate check database error:', rateCheckError);
      return new Response(
        JSON.stringify({ 
          error: 'Database error during rate check',
          details: 'Please try again in a moment'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Recent codes check result:', {
      found: recentCodes?.length || 0,
      codes: recentCodes
    });

    if (recentCodes && recentCodes.length > 0) {
      const lastRequestTime = new Date(recentCodes[0].created_at);
      const timeUntilNext = 90000 - (Date.now() - lastRequestTime.getTime()); // 90 second cooldown
      const secondsLeft = Math.ceil(timeUntilNext / 1000);
      
      console.log('Rate limit hit for username:', username, 'seconds left:', secondsLeft);
      return new Response(
        JSON.stringify({ 
          error: `Please wait ${secondsLeft} seconds before requesting another code`,
          details: 'You can request a new code every 90 seconds'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit verification code
    console.log('Generating verification code...');
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated 6-digit code for username:', username);
    
    // Store verification code (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    console.log('Storing verification code in database with expiry:', expiresAt.toISOString());
    
    const { data: insertData, error: dbError } = await supabase
      .from('verification_codes')
      .insert({
        telegram_username: username,
        verification_code: verificationCode,
        expires_at: expiresAt.toISOString()
      })
      .select();

    if (dbError) {
      console.error('Database insert error:', {
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint
      });
      return new Response(
        JSON.stringify({ error: 'Failed to store verification code in database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Verification code stored successfully:', insertData);

    // Send verification code via Telegram Bot API
    const message = `🔐 Your CampusLink AI verification code is: ${verificationCode}\n\nThis code will expire in 10 minutes.`;
    console.log('Preparing to send message to chat_id:', chatId, 'for username @' + username);

    try {
      // Construct exact Telegram API URL as specified
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      };
      
      console.log('Sending Telegram API request:', {
        url: telegramUrl.replace(botToken, 'BOT_TOKEN_HIDDEN'),
        method: 'POST',
        payload: { 
          chat_id: payload.chat_id,
          chat_id_type: typeof payload.chat_id,
          text: 'VERIFICATION_CODE_MESSAGE',
          parse_mode: payload.parse_mode
        }
      });
      
      const telegramResponse = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('Telegram API response received:', {
        status: telegramResponse.status,
        statusText: telegramResponse.statusText,
        headers: Object.fromEntries(telegramResponse.headers.entries())
      });
      
      const telegramResult = await telegramResponse.json();
      console.log('Full Telegram API response:', telegramResult);
      
      if (!telegramResult.ok) {
        console.error('Telegram API error details:', {
          ok: telegramResult.ok,
          error_code: telegramResult.error_code,
          description: telegramResult.description,
          parameters: telegramResult.parameters
        });
        
        // Clean up the verification code if we can't send it
        console.log('Cleaning up verification code due to Telegram API failure...');
        const { error: cleanupError } = await supabase
          .from('verification_codes')
          .delete()
          .eq('telegram_username', username)
          .eq('verification_code', verificationCode);
          
        if (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }

        // Return specific error messages based on Telegram API response
        if (telegramResult.error_code === 400) {
          if (telegramResult.description?.includes('chat not found') || telegramResult.description?.includes('user not found')) {
            return new Response(
              JSON.stringify({ 
                error: `Chat not found for @${username}. Please send /start to @${botUsername} first to register your account.`,
                botUsername: botUsername,
                needsRegistration: true,
                debug: { chatId, telegramError: telegramResult.description }
              }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else if (telegramResult.description?.includes('bot was blocked') || telegramResult.description?.includes('blocked')) {
            return new Response(
              JSON.stringify({ 
                error: `You have blocked @${botUsername}. Please unblock the bot and try again.`,
                botUsername: botUsername,
                debug: { chatId, telegramError: telegramResult.description }
              }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else if (telegramResult.description?.includes('Forbidden')) {
            return new Response(
              JSON.stringify({ 
                error: `Bot cannot send messages to @${username}. Please send /start to @${botUsername} first.`,
                botUsername: botUsername,
                needsRegistration: true,
                debug: { chatId, telegramError: telegramResult.description }
              }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else {
            return new Response(
              JSON.stringify({ 
                error: `Telegram API error: ${telegramResult.description || 'Unknown error'}`,
                botUsername: botUsername,
                debug: { chatId, telegramError: telegramResult.description, errorCode: telegramResult.error_code }
              }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        return new Response(
          JSON.stringify({ 
            error: `Failed to send verification code: ${telegramResult.description || 'Unknown Telegram API error'}` 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Telegram message sent successfully:', {
        message_id: telegramResult.result?.message_id,
        chat: telegramResult.result?.chat,
        date: telegramResult.result?.date,
        sentToChatId: chatId
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification code sent successfully!',
          botUsername: botUsername,
          debug: { sentToChatId: chatId, username: username }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (telegramError) {
      const errorName = telegramError instanceof Error ? telegramError.name : 'Unknown';
      const errorMessage = telegramError instanceof Error ? telegramError.message : 'Unknown error';
      const errorStack = telegramError instanceof Error ? telegramError.stack : 'No stack trace';
      
      console.error('Telegram request failed with exception:', {
        name: errorName,
        message: errorMessage,
        stack: errorStack
      });
      
      // Clean up the verification code if we can't send it
      console.log('Cleaning up verification code due to Telegram request exception...');
      const { error: cleanupError } = await supabase
        .from('verification_codes')
        .delete()
        .eq('telegram_username', username)
        .eq('verification_code', verificationCode);
        
      if (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }

      return new Response(
        JSON.stringify({ error: 'Network error while sending verification code via Telegram' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'Unknown';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    console.error('Send verification function error:', {
      name: errorName,
      message: errorMessage,
      stack: errorStack
    });
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});