import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      type: string;
    };
    date: number;
    text?: string;
  };
}

interface TelegramLoginData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Received webhook:', JSON.stringify(body, null, 2));

      // Handle Telegram bot updates (messages, commands, etc.)
      if ('update_id' in body) {
        const update: TelegramUpdate = body;
        
        if (update.message && update.message.text) {
          const message = update.message;
          const chatId = message.chat.id;
          const userId = message.from.id;
          const username = message.from.username;
          const firstName = message.from.first_name;
          const lastName = message.from.last_name;
          const text = message.text;
          
          console.log(`Received message from ${username || firstName}: ${text}`);
          
          // Handle /start command
          if (text.startsWith('/start')) {
            console.log(`Processing /start command from user_id: ${userId}, chat_id: ${chatId}, username: ${username || 'NO_USERNAME'}`);
            
            // Handle users without username
            if (!username) {
              console.log(`User ${userId} attempted /start without username`);
              const noUsernameMessage = `❌ You need to set a Telegram username to use this service.

Please:
1. Go to Telegram Settings → Username
2. Set a username (starting with @)
3. Send /start again

Without a username, we can't verify your identity for class swaps.`;

              try {
                await sendTelegramMessage(chatId, telegramBotToken, noUsernameMessage);
                console.log(`Sent no-username message to chat_id: ${chatId}`);
              } catch (error) {
                console.error(`Failed to send no-username message to chat_id ${chatId}:`, error);
              }
              
              // Always return OK to Telegram
              return new Response('OK', { 
                headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
                status: 200 
              });
            }

            // Store/update user profile with chat_id
            console.log(`Storing profile: username=${username}, user_id=${userId}, chat_id=${chatId}`);
            
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .upsert({
                  telegram_username: username,
                  telegram_user_id: userId,
                  telegram_chat_id: Number(chatId), // Ensure it's stored as a number
                  first_name: firstName,
                  last_name: lastName,
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'telegram_username'
                })
                .select();

              if (profileError) {
                console.error('Database error creating/updating profile:', {
                  error: profileError,
                  username: username,
                  chatId: chatId,
                  userId: userId
                });
              } else {
                console.log('Profile upserted successfully:', {
                  username: username,
                  chatId: chatId,
                  userId: userId,
                  profileData: profileData
                });
              }
            } catch (dbException) {
              console.error('Database exception during profile upsert:', {
                error: dbException,
                username: username,
                chatId: chatId
              });
            }

            // Send welcome message
            const welcomeMessage = `🎓 Welcome to CampusLink AI!

I'm here to help you with class swaps.

✅ Your profile has been set up with username: @${username}
📱 Chat ID: ${chatId} (stored for verification codes)

To get started:
1. Visit our website
2. Enter your username (@${username})
3. I'll send you a verification code here
4. Use that code to complete your login

Let's make class scheduling easier together! 🚀`;

            try {
              await sendTelegramMessage(chatId, telegramBotToken, welcomeMessage);
              console.log(`Welcome message sent successfully to @${username} (chat_id: ${chatId})`);
            } catch (messageError) {
              console.error(`Failed to send welcome message to @${username} (chat_id: ${chatId}):`, messageError);
            }
          }
          
          // Log other messages for debugging
          else {
            console.log(`Received non-start message from @${username || 'NO_USERNAME'} (chat_id: ${chatId}): ${text}`);
          }
        }

        // Always return OK to Telegram for webhook updates
        return new Response('OK', { 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
          status: 200 
        });
      }

      // Handle Telegram Login Widget authentication
      if ('id' in body && 'auth_date' in body && 'hash' in body) {
        const loginData: TelegramLoginData = body;
        
        console.log('Telegram login attempt:', { 
          id: loginData.id, 
          username: loginData.username, 
          auth_date: loginData.auth_date 
        });

        // Verify the authentication data with proper HMAC-SHA256
        const isValid = await verifyTelegramAuth(loginData, telegramBotToken);
        if (!isValid) {
          console.error('Authentication verification failed for user:', loginData.username || loginData.id);
          return new Response(
            JSON.stringify({ error: 'Authentication verification failed' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401 
            }
          );
        }

        console.log('Authentication verified successfully for user:', loginData.username || loginData.id);

        // Create or update user session
        const { data: sessionData, error } = await supabase
          .rpc('create_user_session', {
            p_telegram_user_id: loginData.id,
            p_telegram_username: loginData.username || `user_${loginData.id}`,
            p_telegram_chat_id: loginData.id, // For DM, chat_id equals user_id
            p_first_name: loginData.first_name,
            p_last_name: loginData.last_name || null
          });

        if (error) {
          console.error('Database error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to create session' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          );
        }

        console.log('Session created:', sessionData);

        return new Response(
          JSON.stringify({ 
            success: true, 
            session_token: sessionData[0].session_token,
            profile_id: sessionData[0].profile_id
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Handle GET request (for webhook verification)
    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({ status: 'Telegram webhook endpoint active' }),
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

// Verify Telegram authentication data with proper HMAC-SHA256
async function verifyTelegramAuth(data: TelegramLoginData, botToken: string): Promise<boolean> {
  // Input validation
  if (!data || !botToken) {
    console.error('Missing data or bot token for verification');
    return false;
  }

  // Validate required fields
  const requiredFields = ['id', 'auth_date', 'hash'];
  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Check if auth_date is recent (within 1 day) to prevent replay attacks
  const authDate = parseInt(data.auth_date.toString());
  const currentTime = Math.floor(Date.now() / 1000);
  const timeDiff = currentTime - authDate;
  
  if (isNaN(authDate) || timeDiff > 86400) { // 24 hours
    console.error('Auth data too old or invalid:', { authDate, timeDiff });
    return false;
  }
  
  try {
    // Create secret key by hashing bot token with SHA256
    const encoder = new TextEncoder();
    const botTokenBytes = encoder.encode(botToken);
    
    // Create the secret key using SHA-256 of bot token
    const secretKeyMaterial = await crypto.subtle.digest('SHA-256', botTokenBytes);
    
    // Import the secret key for HMAC
    const secretKey = await crypto.subtle.importKey(
      'raw',
      secretKeyMaterial,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Create data check string by sorting keys (except hash) and joining with newlines
    const { hash, ...authData } = data;
    const dataCheckString = Object.keys(authData)
      .sort()
      .map(key => `${key}=${authData[key]}`)
      .join('\n');
    
    console.log('Verification data check string:', dataCheckString);
    
    // Generate HMAC-SHA256
    const dataBytes = encoder.encode(dataCheckString);
    const signature = await crypto.subtle.sign('HMAC', secretKey, dataBytes);
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Compare with provided hash
    const isValid = hashHex === data.hash.toLowerCase();
    
    if (!isValid) {
      console.error('HMAC verification failed:', {
        expected: data.hash.toLowerCase(),
        calculated: hashHex,
        dataCheckString
      });
    } else {
      console.log('HMAC verification successful for user:', data.username || data.id);
    }
    
    return isValid;
    
  } catch (error) {
    console.error('Telegram auth verification error:', error);
    return false;
  }
}

// Send message via Telegram Bot API
async function sendTelegramMessage(chatId: number, botToken: string, text: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      }),
    });

    const result = await response.json();
    console.log('Telegram API response:', result);
    return result;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return null;
  }
}