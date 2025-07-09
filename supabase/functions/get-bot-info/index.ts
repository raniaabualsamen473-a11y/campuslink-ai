import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = '7826037183:AAGe3HjAS8TXyozVkPKzMDhqsnRJwAYib9k';
    
    const getMeUrl = `https://api.telegram.org/bot${botToken}/getMe`;
    const getMeResponse = await fetch(getMeUrl);
    const getMeResult = await getMeResponse.json();
    
    if (!getMeResult.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to get bot info' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        botUsername: getMeResult.result.username,
        botName: getMeResult.result.first_name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get bot info error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});