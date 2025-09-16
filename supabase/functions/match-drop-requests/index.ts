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

    const { record } = await req.json();
    console.log('Processing drop request:', record);

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
        .eq('desired_section_number', droppedSection);

      if (swapError) {
        console.error('Error checking swap matches:', swapError);
      } else if (swapMatches && swapMatches.length > 0) {
        console.log(`Found ${swapMatches.length} swap request matches`);
        matches.push(...swapMatches.map(match => ({
          type: 'swap_request',
          data: match,
          match_reason: `Wants ${droppedCourse} section ${droppedSection}`
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

            // Send notification (integrate with existing webhook)
            try {
              const notificationData = {
                type: 'drop_match_found',
                dropper: {
                  user_id: record.user_id,
                  telegram_username: record.telegram_username,
                  course: droppedCourse,
                  section: droppedSection
                },
                requester: {
                  user_id: match.data.user_id,
                  telegram_username: match.data.telegram_username,
                  wanted_course: match.data.request_course || match.data.desired_course,
                  wanted_section: match.data.request_section_number || match.data.desired_section_number
                },
                match_reason: match.match_reason
              };

              // Call existing notification webhook
              const webhookResponse = await fetch('https://pbqpbupsmzafbzlxccov.supabase.co/functions/v1/match-notification-webhook', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
                },
                body: JSON.stringify(notificationData)
              });

              if (!webhookResponse.ok) {
                console.error('Failed to send notification:', await webhookResponse.text());
              } else {
                console.log('Notification sent successfully');
              }
            } catch (notificationError) {
              console.error('Error sending notification:', notificationError);
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