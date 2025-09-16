import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get bot token at the top level to avoid scope issues
    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

    const { record } = await req.json();
    console.log('Processing drop request:', record);

    // Check if this drop request has already been processed to prevent duplicates
    if (record.processed_at) {
      console.log('Drop request already processed at:', record.processed_at);
      return new Response(JSON.stringify({ 
        success: true, 
        matches_found: 0,
        message: 'Request already processed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark this request as processed immediately to prevent duplicate processing
    try {
      await supabase
        .from('drop_requests')
        .update({ processed_at: new Date().toISOString() })
        .eq('id', record.id);
      console.log('Marked request as processed');
    } catch (updateError) {
      console.error('Error updating processed_at:', updateError);
    }

    const matches = [];

    // Only process if someone is dropping a course
    if ((record.action_type === 'drop_only' || record.action_type === 'drop_and_request') && 
        record.drop_course && record.drop_section_number) {
      
      const droppedCourse = record.drop_course.toLowerCase();
      const droppedSection = record.drop_section_number;
      
      console.log(`Looking for matches for dropped course: ${droppedCourse} section ${droppedSection}`);

      // 1. Check existing swap_requests for people wanting this course/section
      const { data: swapMatches, error: swapError } = await supabase
        .from('swap_requests')
        .select('*')
        .ilike('desired_course', `%${droppedCourse}%`)
        .eq('desired_section_number', droppedSection)
        .neq('user_id', record.user_id); // Don't match with same user

      if (swapError) {
        console.error('Error checking swap matches:', swapError);
      } else if (swapMatches && swapMatches.length > 0) {
        console.log(`Found ${swapMatches.length} swap request matches`);
        matches.push(...swapMatches.map(match => ({
          type: 'swap_request',
          data: match,
          match_reason: `Wants ${droppedCourse} section ${droppedSection}`,
          match_telegram: match.telegram_username,
          match_full_name: match.full_name
        })));
      }

      // 2. Check drop_requests for request_only and drop_and_request (request part)
      const { data: dropMatches, error: dropError } = await supabase
        .from('drop_requests')
        .select('*')
        .ilike('request_course', `%${droppedCourse}%`)
        .or(`request_section_number.eq.${droppedSection},any_section_flexible.eq.true`)
        .in('action_type', ['request_only', 'drop_and_request'])
        .neq('user_id', record.user_id); // Don't match with same user

      if (dropError) {
        console.error('Error checking drop matches:', dropError);
      } else if (dropMatches && dropMatches.length > 0) {
        console.log(`Found ${dropMatches.length} drop request matches`);
        matches.push(...dropMatches.map(match => ({
          type: 'drop_request',
          data: match,
          match_reason: match.any_section_flexible 
            ? `Wants ${droppedCourse} (any section)` 
            : `Wants ${droppedCourse} section ${match.request_section_number}`
        })));
      }

      // 3. If matches found, create match records and send notifications
      if (matches.length > 0) {
        console.log(`Creating ${matches.length} match records`);
        
        for (const match of matches) {
          try {
            // Check if match already exists to prevent duplicates
            const { data: existingMatch } = await supabase
              .from('matches')
              .select('id')
              .eq('requester_user_id', record.user_id)
              .eq('match_user_id', match.data.user_id)
              .eq('desired_course', droppedCourse)
              .eq('normalized_current_section', `${droppedCourse}_${droppedSection}`)
              .limit(1);

            if (existingMatch && existingMatch.length > 0) {
              console.log('Match already exists, skipping duplicate');
              continue;
            }

            // Create match record in matches table
            const matchData = {
              requester_user_id: record.user_id,
              match_user_id: match.data.user_id,
              desired_course: droppedCourse,
              current_section: `${droppedCourse} ${droppedSection}`,
              desired_section: match.type === 'swap_request' 
                ? `${match.data.desired_course} ${match.data.desired_section_number}`
                : `${match.data.request_course} ${match.data.request_section_number || 'Any'}`,
              normalized_current_section: `${droppedCourse}_${droppedSection}`,
              normalized_desired_section: match.type === 'swap_request'
                ? `${match.data.desired_course.toLowerCase()}_${match.data.desired_section_number}`
                : `${match.data.request_course.toLowerCase()}_${match.data.request_section_number || 'flexible'}`,
              match_telegram: match.data.telegram_username,
              match_full_name: match.data.full_name
            };

            const { error: matchError } = await supabase
              .from('matches')
              .insert(matchData);

            if (matchError) {
              console.error('Error creating match record:', matchError);
            } else {
              console.log('Match record created successfully');
            }

            // Send Telegram notification directly
            try {
              if (telegramBotToken && match.data.telegram_username) {
                try {
                  // Get chat ID from telegram username
                  const { data: profileData } = await supabase
                    .from('profiles')
                    .select('telegram_chat_id')
                    .eq('telegram_username', match.data.telegram_username)
                    .single();

                  if (profileData?.telegram_chat_id) {
                    // Escape special characters for Telegram Markdown
                    const escapeMarkdown = (text: string) => {
                      return text.replace(/[*_`\[\]()~>#+=|{}.!-]/g, '\\$&');
                    };

                    const courseName = escapeMarkdown(droppedCourse);
                    const username = escapeMarkdown(record.telegram_username || 'Unknown');

                    const message = `🎯 *Match Found!*\n\n` +
                      `Someone is dropping "${courseName} Section ${droppedSection}" that you wanted!\n\n` +
                      `💬 Contact: @${username}\n` +
                      `📚 Course: ${courseName}\n` +
                      `📝 Section: ${droppedSection}\n\n` +
                      `Reach out to them quickly to take their spot!`;

                    const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        chat_id: profileData.telegram_chat_id,
                        text: message,
                        parse_mode: 'Markdown'
                      })
                    });

                    if (!telegramResponse.ok) {
                      const errorText = await telegramResponse.text();
                      console.error('Failed to send Telegram message:', errorText);
                    } else {
                      console.log('Telegram notification sent successfully');
                    }
                  } else {
                    console.log('No chat ID found for username:', match.data.telegram_username);
                  }
                } catch (telegramError) {
                  console.error('Telegram notification error:', telegramError);
                }
              } else {
                console.log('No Telegram bot token or username available');
              }
            } catch (notificationError) {
              console.error('Error sending notification:', notificationError);
            }

            // Send notification to the dropper
            try {
              if (telegramBotToken && record.telegram_username) {
                const { data: dropperProfileData } = await supabase
                  .from('profiles')
                  .select('telegram_chat_id')
                  .eq('telegram_username', record.telegram_username)
                  .single();

                if (dropperProfileData?.telegram_chat_id) {
                  const escapeMarkdown = (text: string) => {
                    return text.replace(/[*_`\[\]()~>#+=|{}.!-]/g, '\\$&');
                  };

                  const courseName = escapeMarkdown(droppedCourse);
                  const requesterUsername = escapeMarkdown(match.data.telegram_username || 'Unknown');

                  const dropperMessage = `📢 *Someone Wants Your Course!*\n\n` +
                    `A student wants the course you're dropping: "${courseName} Section ${droppedSection}"\n\n` +
                    `💬 Contact: @${requesterUsername}\n` +
                    `📚 Course: ${courseName}\n` +
                    `📝 Section: ${droppedSection}\n\n` +
                    `Reach out to coordinate the transfer!`;

                  const dropperTelegramResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chat_id: dropperProfileData.telegram_chat_id,
                      text: dropperMessage,
                      parse_mode: 'Markdown'
                    })
                  });

                  if (!dropperTelegramResponse.ok) {
                    const errorText = await dropperTelegramResponse.text();
                    console.error('Failed to send dropper Telegram message:', errorText);
                  } else {
                    console.log('Dropper notification sent successfully');
                  }
                } else {
                  console.log('No chat ID found for dropper username:', record.telegram_username);
                }
              }
            } catch (dropperNotificationError) {
              console.error('Error sending dropper notification:', dropperNotificationError);
            }
          } catch (error) {
            console.error('Error processing match:', error);
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      matches_found: matches.length,
      message: matches.length > 0 ? `Found ${matches.length} potential matches` : 'No matches found'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in match-drop-requests function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});