import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchPayload {
  type?: string;
  request_a_id?: string;
  request_b_id?: string;
  requester_request_id?: string;
  matcher_request_id?: string;
  data?: {
    request_a_id?: string;
    request_b_id?: string;
  };
}

async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN not configured");

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  const result = await res.json();
  if (!res.ok || !result.ok) {
    throw new Error(`Telegram API error: ${res.status} ${JSON.stringify(result)}`);
  }
  return result;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const body: MatchPayload = await req.json();
    console.log("match-notification-webhook received payload:", JSON.stringify(body));

    // Try to extract the two request IDs from multiple possible shapes
    const requestAId =
      body.request_a_id || body.requester_request_id || body.data?.request_a_id;
    const requestBId =
      body.request_b_id || body.matcher_request_id || body.data?.request_b_id;

    if (!requestAId || !requestBId) {
      console.error("Missing request IDs in payload", body);
      return new Response(
        JSON.stringify({ error: "request_a_id and request_b_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch both swap requests
    const { data: requests, error: reqErr } = await supabase
      .from("swap_requests")
      .select("*")
      .in("id", [requestAId, requestBId]);

    if (reqErr) throw reqErr;
    if (!requests || requests.length < 2) {
      throw new Error("Could not load both swap requests");
    }

    const requestA = requests.find((r: any) => r.id === requestAId)!;
    const requestB = requests.find((r: any) => r.id === requestBId)!;

    // Load profiles by linking user_id to profiles.id  
    const userIds: string[] = [requestA.user_id, requestB.user_id].filter(Boolean);

    let profiles: any[] = [];
    if (userIds.length > 0) {
      const { data: profs, error: profErr } = await supabase
        .from("profiles")
        .select("id, telegram_chat_id, telegram_username, first_name, last_name")
        .in("id", userIds);
      if (profErr) throw profErr;
      profiles = profs || [];
    }

    const profileA = profiles.find((p) => p.id === requestA.user_id);
    const profileB = profiles.find((p) => p.id === requestB.user_id);

    const chatIdA: number | undefined = profileA?.telegram_chat_id;
    const chatIdB: number | undefined = profileB?.telegram_chat_id;

    // Check if this match already exists to avoid duplicate notifications
    const { data: existing, error: existErr } = await supabase
      .from("matches")
      .select("request_id, match_user_id")
      .eq("request_id", requestA.id)
      .eq("match_user_id", requestB.user_id)
      .limit(1);
    if (existErr) throw existErr;

    const alreadyExists = Array.isArray(existing) && existing.length > 0;

    // Prepare rows to record matches (both directions)
    const rows = [
      {
        request_id: requestA.id,
        requester_user_id: requestA.user_id,
        match_user_id: requestB.user_id,
        desired_course: requestA.desired_course,
        normalized_current_section: requestB.normalized_current_section,
        normalized_desired_section: requestB.normalized_desired_section,
        match_full_name: requestB.full_name,
        match_telegram: requestB.telegram_username,
        current_section: requestB.current_section,
        desired_section: requestB.desired_section,
      },
      {
        request_id: requestB.id,
        requester_user_id: requestB.user_id,
        match_user_id: requestA.user_id,
        desired_course: requestB.desired_course,
        normalized_current_section: requestA.normalized_current_section,
        normalized_desired_section: requestA.normalized_desired_section,
        match_full_name: requestA.full_name,
        match_telegram: requestA.telegram_username,
        current_section: requestA.current_section,
        desired_section: requestA.desired_section,
      },
    ];

    if (!alreadyExists) {
      const { error: upsertErr } = await supabase
        .from("matches")
        .upsert(rows, { onConflict: "request_id,match_user_id", ignoreDuplicates: true });
      if (upsertErr) throw upsertErr;
    } else {
      console.log("Match already exists in DB, skipping DB insert and notifications", {
        requestAId: requestA.id,
        matchUserId: requestB.user_id,
      });
      return new Response(
        JSON.stringify({ success: true, status: "already_exists" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Craft notification messages
    const course = requestA.desired_course || requestB.desired_course || "your course";

    const msgForA = `✅ Match found for <b>${course}</b>!\n\n` +
      `You want: <b>${requestA.desired_section || "Desired"}</b>\n` +
      `They have: <b>${requestB.current_section || "Their current"}</b>\n\n` +
      `${requestB.telegram_username ? `Contact: @${requestB.telegram_username}` : ""}`;

    const msgForB = `✅ Match found for <b>${course}</b>!\n\n` +
      `You want: <b>${requestB.desired_section || "Desired"}</b>\n` +
      `They have: <b>${requestA.current_section || "Their current"}</b>\n\n` +
      `${requestA.telegram_username ? `Contact: @${requestA.telegram_username}` : ""}`;

    // Send Telegram notifications (best-effort)
    const results: any = { sent: [] as string[], skipped: [] as string[] };

    if (chatIdA) {
      try {
        await sendTelegramMessage(chatIdA, msgForA);
        results.sent.push("A");
      } catch (e) {
        console.error("Failed to send Telegram to A:", e);
        results.skipped.push("A");
      }
    } else {
      console.warn("Missing chatId for A");
      results.skipped.push("A");
    }

    if (chatIdB) {
      try {
        await sendTelegramMessage(chatIdB, msgForB);
        results.sent.push("B");
      } catch (e) {
        console.error("Failed to send Telegram to B:", e);
        results.skipped.push("B");
      }
    } else {
      console.warn("Missing chatId for B");
      results.skipped.push("B");
    }

    console.log("Notification results:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in match-notification-webhook:", error);
    return new Response(JSON.stringify({ error: (error as any).message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
