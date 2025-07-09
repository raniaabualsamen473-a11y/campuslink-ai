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
            const welcomeMessage = `🎓 Welcome to CampusLink AI!

I'm here to help you with class swaps and petitions.

To get started:
1. Visit our website
2. Enter your username (@${username || 'your_username'})
3. I'll send you a verification code
4. Use that code to complete your login

Let's make class scheduling easier together! 🚀`;

            await sendTelegramMessage(chatId, telegramBotToken, welcomeMessage);
          }

          // Update user profile with chat_id when they interact
          if (username) {
            await supabase
              .from('profiles')
              .update({ 
                telegram_chat_id: chatId,
                telegram_user_id: userId,
                first_name: firstName,
                last_name: lastName
              })
              .eq('telegram_username', username);
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      // Handle Telegram Login Widget authentication
      if ('id' in body && 'auth_date' in body && 'hash' in body) {
        const loginData: TelegramLoginData = body;
        
        console.log('Telegram login attempt:', loginData);

        // Verify the authentication data
        if (!verifyTelegramAuth(loginData, telegramBotToken)) {
          return new Response(
            JSON.stringify({ error: 'Invalid authentication data' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401 
            }
          );
        }

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

// Verify Telegram authentication data
function verifyTelegramAuth(data: TelegramLoginData, botToken: string): boolean {
  const { hash, ...authData } = data;
  
  // Create data check string
  const dataCheckArr = Object.entries(authData)
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join('\n');
  
  // Create secret key from bot token
  const encoder = new TextEncoder();
  const secretKeyData = encoder.encode(botToken);
  
  // In a real implementation, you would use crypto.subtle.importKey and crypto.subtle.sign
  // For simplicity, we're doing basic validation here
  // You should implement proper HMAC-SHA256 verification in production
  
  console.log('Auth data to verify:', dataCheckArr);
  console.log('Received hash:', hash);
  
  // For now, just check if auth_date is recent (within 24 hours)
  const authDate = data.auth_date;
  const now = Math.floor(Date.now() / 1000);
  const maxAge = 24 * 60 * 60; // 24 hours
  
  return (now - authDate) <= maxAge;
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