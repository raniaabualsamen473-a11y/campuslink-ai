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
    
    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

    const { record } = await req.json();
    console.log('🔍 Processing drop request:', {
      id: record.id,
      action_type: record.action_type,
      drop_course: record.drop_course,
      drop_section_number: record.drop_section_number,
      user_id: record.user_id
    });

    // Check if this drop request has already been processed
    if (record.processed_at) {
      console.log('⏭️ Drop request already processed at:', record.processed_at);
      return new Response(JSON.stringify({ 
        success: true, 
        matches_found: 0,
        message: 'Request already processed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark as processed immediately to prevent duplicates
    try {
      await supabase
        .from('drop_requests')
        .update({ processed_at: new Date().toISOString() })
        .eq('id', record.id);
      console.log('✅ Marked request as processed');
    } catch (updateError) {
      console.error('❌ Error updating processed_at:', updateError);
    }

    const matches = [];

    // CORE LOGIC: Drop-to-Want Matching
    // When someone drops a course/section, find people who WANT that course/section
    if ((record.action_type === 'drop_only' || record.action_type === 'drop_and_request') && 
        record.drop_course && record.drop_section_number && record.user_id) {
      
      const droppedCourse = record.drop_course.trim();
      const droppedSection = record.drop_section_number;
      
      console.log(`🎯 Looking for people who WANT: ${droppedCourse} section ${droppedSection}`);
      console.log(`🚫 Excluding dropper user: ${record.user_id}`);

      // 1. Find people in swap_requests who WANT this course/section (desired_course/desired_section)
      console.log('🔍 Checking swap_requests for people wanting this course...');
      const { data: swapMatches, error: swapError } = await supabase
        .from('swap_requests')
        .select('*')
        .ilike('desired_course', `%${droppedCourse}%`)
        .eq('desired_section_number', droppedSection)
        .neq('user_id', record.user_id);

      if (swapError) {
        console.error('❌ Error checking swap matches:', swapError);
      } else if (swapMatches && swapMatches.length > 0) {
        console.log(`✅ Found ${swapMatches.length} people in swap_requests wanting this course`);
        swapMatches.forEach(match => {
          console.log(`  - User ${match.user_id} wants ${match.desired_course} section ${match.desired_section_number}`);
        });
        matches.push(...swapMatches.map(match => ({
          type: 'swap_request',
          data: match,
          match_reason: `Wants ${droppedCourse} section ${droppedSection} (from swap request)`,
          match_telegram: match.telegram_username,
          match_full_name: match.full_name
        })));
      } else {
        console.log('ℹ️ No swap_request matches found');
      }

      // 2. Find people in drop_requests who WANT this course/section (request_course/request_section)
      console.log('🔍 Checking drop_requests for people wanting this course...');
      const { data: dropMatches, error: dropError } = await supabase
        .from('drop_requests')
        .select('*')
        .ilike('request_course', `%${droppedCourse}%`)
        .or(`request_section_number.eq.${droppedSection},any_section_flexible.eq.true`)
        .in('action_type', ['request_only', 'drop_and_request'])
        .neq('user_id', record.user_id);

      if (dropError) {
        console.error('❌ Error checking drop matches:', dropError);
      } else if (dropMatches && dropMatches.length > 0) {
        console.log(`✅ Found ${dropMatches.length} people in drop_requests wanting this course`);
        dropMatches.forEach(match => {
          console.log(`  - User ${match.user_id} wants ${match.request_course} section ${match.request_section_number || 'any'}`);
        });
        matches.push(...dropMatches.map(match => ({
          type: 'drop_request',
          data: match,
          match_reason: match.any_section_flexible 
            ? `Wants ${droppedCourse} (any section)` 
            : `Wants ${droppedCourse} section ${match.request_section_number}`,
          match_telegram: match.telegram_username,
          match_full_name: match.full_name
        })));
      } else {
        console.log('ℹ️ No drop_request matches found');
      }

      // 3. Create match records and send notifications
      if (matches.length > 0) {
        console.log(`🎉 Creating ${matches.length} match records for dropped course`);
        
        for (const match of matches) {
          try {
            // Check for duplicates
            const { data: existingMatch } = await supabase
              .from('matches')
              .select('id')
              .or(`and(requester_user_id.eq.${record.user_id},match_user_id.eq.${match.data.user_id}),and(requester_user_id.eq.${match.data.user_id},match_user_id.eq.${record.user_id})`)
              .ilike('desired_course', `%${droppedCourse}%`)
              .limit(1);

            if (existingMatch && existingMatch.length > 0) {
              console.log(`⏭️ Match already exists between users ${record.user_id} and ${match.data.user_id}, skipping`);
              continue;
            }

            // Validate required data
            if (!record.user_id || !match.data.user_id) {
              console.error('❌ Missing user IDs:', { 
                dropper: record.user_id, 
                wanter: match.data.user_id 
              });
              continue;
            }

            // Create match record - CORRECTED STRUCTURE
            const matchData = {
              requester_user_id: record.user_id,  // The person who dropped (making course available)
              match_user_id: match.data.user_id,  // The person who wants it
              desired_course: droppedCourse,      // The course that was dropped/wanted
              current_section: null,              // Dropper doesn't have a "current" section concept
              desired_section: `${droppedCourse} Section ${droppedSection}`, // What the wanter gets
              normalized_current_section: null,
              normalized_desired_section: `${droppedCourse.toLowerCase()}_${droppedSection}`,
              match_telegram: match.data.telegram_username,
              match_full_name: match.data.full_name
            };

            console.log('📝 Creating match with data:', matchData);

            const { error: matchError } = await supabase
              .from('matches')
              .insert(matchData);

            if (matchError) {
              console.error('❌ Error creating match record:', matchError);
              continue;
            } else {
              console.log('✅ Match record created successfully');
            }

            // Send notification to the person who wants the course
            await sendNotificationToWanter(supabase, telegramBotToken, match.data, record, droppedCourse, droppedSection);
            
            // Send notification to the person who dropped the course
            await sendNotificationToDropper(supabase, telegramBotToken, record, match.data, droppedCourse, droppedSection);

          } catch (error) {
            console.error('❌ Error processing match:', error);
          }
        }
      } else {
        console.log('ℹ️ No matches found for dropped course');
      }
    } else {
      console.log('ℹ️ Request is not a drop action or missing required fields');
    }

    // REVERSE MATCHING: Swap-to-Drop Matching
    // Check if anyone in swap_requests has a CURRENT section that someone wants to drop
    console.log('🔄 Checking for reverse matches: swap current sections with drop requests...');
    
    const { data: allSwapRequests, error: swapFetchError } = await supabase
      .from('swap_requests')
      .select('*')
      .neq('user_id', record.user_id);

    if (swapFetchError) {
      console.error('❌ Error fetching swap requests:', swapFetchError);
    } else if (allSwapRequests && allSwapRequests.length > 0) {
      console.log(`🔄 Found ${allSwapRequests.length} swap requests to check for reverse matches`);
      
      for (const swapRequest of allSwapRequests) {
        // Check if this drop request WANTS what someone is currently in (their current_section)
        if (record.request_course && swapRequest.current_section && 
            swapRequest.desired_course && swapRequest.current_section_number) {
          
          const swapperCurrentCourse = swapRequest.desired_course; // What course they're in
          const swapperCurrentSection = swapRequest.current_section_number;
          
          // Check if the drop request wants what the swapper currently has
          const courseMatch = record.request_course.toLowerCase().includes(swapperCurrentCourse.toLowerCase()) ||
                             swapperCurrentCourse.toLowerCase().includes(record.request_course.toLowerCase());
          
          const sectionMatch = record.request_section_number === swapperCurrentSection || 
                              record.any_section_flexible;
          
          if (courseMatch && sectionMatch) {
            console.log(`🎯 Reverse match found: Drop requester wants ${record.request_course} section ${record.request_section_number || 'any'}, Swapper has ${swapperCurrentCourse} section ${swapperCurrentSection}`);
            
            // Check for duplicates
            const { data: existingMatch } = await supabase
              .from('matches')
              .select('id')
              .or(`and(requester_user_id.eq.${record.user_id},match_user_id.eq.${swapRequest.user_id}),and(requester_user_id.eq.${swapRequest.user_id},match_user_id.eq.${record.user_id})`)
              .ilike('desired_course', `%${swapperCurrentCourse}%`)
              .limit(1);

            if (existingMatch && existingMatch.length > 0) {
              console.log(`⏭️ Reverse match already exists, skipping`);
              continue;
            }

            // Create reverse match record
            const reverseMatchData = {
              requester_user_id: swapRequest.user_id, // The swapper who has what the drop requester wants
              match_user_id: record.user_id, // The drop requester who wants it
              desired_course: swapperCurrentCourse,
              current_section: swapRequest.current_section, // What the swapper currently has
              desired_section: `${swapperCurrentCourse} Section ${swapperCurrentSection}`, // What the drop requester gets
              normalized_current_section: `${swapperCurrentCourse.toLowerCase()}_${swapperCurrentSection}`,
              normalized_desired_section: `${swapperCurrentCourse.toLowerCase()}_${swapperCurrentSection}`,
              match_telegram: record.telegram_username,
              match_full_name: record.full_name
            };

            console.log('📝 Creating reverse match with data:', reverseMatchData);

            const { error: reverseMatchError } = await supabase
              .from('matches')
              .insert(reverseMatchData);

            if (reverseMatchError) {
              console.error('❌ Error creating reverse match record:', reverseMatchError);
            } else {
              console.log('✅ Reverse match record created successfully');
              matches.push({
                type: 'reverse_match',
                data: swapRequest,
                match_reason: `Has ${swapperCurrentCourse} section ${swapperCurrentSection} that you want`,
                match_telegram: swapRequest.telegram_username,
                match_full_name: swapRequest.full_name
              });
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      matches_found: matches.length,
      message: matches.length > 0 ? `Found ${matches.length} people wanting the dropped course` : 'No one found wanting this course'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in match-drop-requests function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to send notification to person who wants the course
async function sendNotificationToWanter(supabase: any, telegramBotToken: string, wanter: any, dropper: any, courseName: string, sectionNumber: number) {
  if (!telegramBotToken || !wanter.telegram_username) {
    console.log('⏭️ No Telegram token or username for wanter notification');
    return;
  }

  try {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('telegram_chat_id')
      .eq('telegram_username', wanter.telegram_username)
      .single();

    if (!profileData?.telegram_chat_id) {
      console.log('⏭️ No chat ID found for wanter:', wanter.telegram_username);
      return;
    }

    const escapeMarkdown = (text: string) => text.replace(/[*_`\[\]()~>#+=|{}.!-]/g, '\\$&');
    const courseNameEscaped = escapeMarkdown(courseName);
    const dropperUsername = escapeMarkdown(dropper.telegram_username || 'Unknown');

    const message = `🎯 *Match Found!*\n\n` +
      `Someone is dropping "${courseNameEscaped} Section ${sectionNumber}" that you wanted!\n\n` +
      `💬 Contact: @${dropperUsername}\n` +
      `📚 Course: ${courseNameEscaped}\n` +
      `📝 Section: ${sectionNumber}\n\n` +
      `Reach out to them quickly to take their spot!`;

    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: profileData.telegram_chat_id,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (response.ok) {
      console.log('✅ Notification sent to wanter');
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to send wanter notification:', errorText);
    }
  } catch (error) {
    console.error('❌ Error sending wanter notification:', error);
  }
}

// Helper function to send notification to person who dropped the course  
async function sendNotificationToDropper(supabase: any, telegramBotToken: string, dropper: any, wanter: any, courseName: string, sectionNumber: number) {
  if (!telegramBotToken || !dropper.telegram_username) {
    console.log('⏭️ No Telegram token or username for dropper notification');
    return;
  }

  try {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('telegram_chat_id')
      .eq('telegram_username', dropper.telegram_username)
      .single();

    if (!profileData?.telegram_chat_id) {
      console.log('⏭️ No chat ID found for dropper:', dropper.telegram_username);
      return;
    }

    const escapeMarkdown = (text: string) => text.replace(/[*_`\[\]()~>#+=|{}.!-]/g, '\\$&');
    const courseNameEscaped = escapeMarkdown(courseName);
    const wanterUsername = escapeMarkdown(wanter.telegram_username || 'Unknown');

    const message = `📢 *Someone Wants Your Course!*\n\n` +
      `A student wants the course you're dropping: "${courseNameEscaped} Section ${sectionNumber}"\n\n` +
      `💬 Contact: @${wanterUsername}\n` +
      `📚 Course: ${courseNameEscaped}\n` +
      `📝 Section: ${sectionNumber}\n\n` +
      `Reach out to coordinate the transfer!`;

    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: profileData.telegram_chat_id,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (response.ok) {
      console.log('✅ Notification sent to dropper');
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to send dropper notification:', errorText);
    }
  } catch (error) {
    console.error('❌ Error sending dropper notification:', error);
  }
}