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
    
    if (!telegramBotToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Telegram bot token not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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

    // BIDIRECTIONAL MATCHING LOGIC
    // Handle both drop-to-want matching AND request-to-available matching
    
    // PART 1: Drop-to-Want Matching
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
        .or(`desired_course.ilike.%${droppedCourse}%,desired_course.ilike.%${droppedCourse.replace(/\s+/g, '%')}%`)
        .eq('desired_section_number', droppedSection)
        .neq('user_id', record.user_id);

      if (swapError) {
        console.error('❌ Error checking swap matches:', swapError);
      } else if (swapMatches && swapMatches.length > 0) {
        console.log(`✅ Found ${swapMatches.length} people in swap_requests wanting this course`);
        swapMatches.forEach(match => {
          console.log(`  - User ${match.user_id} wants ${match.desired_course} section ${match.desired_section_number}`);
        });
        for (const match of swapMatches) {
          const swapContactInfo = await getContactInfo(supabase, match);
          matches.push({
            type: 'swap_request',
            data: match,
            match_reason: `Wants ${droppedCourse} section ${droppedSection} (from swap request)`,
            match_telegram: swapContactInfo.telegram_username,
            match_full_name: swapContactInfo.full_name
          });
        }
      } else {
        console.log('ℹ️ No swap_request matches found');
      }

      // 2. Find people in drop_requests who WANT this course/section (request_course/request_section)
      console.log('🔍 Checking drop_requests for people wanting this course...');
      const { data: dropMatches, error: dropError } = await supabase
        .from('drop_requests')
        .select('*')
        .or(`request_course.ilike.%${droppedCourse}%,request_course.ilike.%${droppedCourse.replace(/\s+/g, '%')}%`)
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
        for (const match of dropMatches) {
          const dropContactInfo = await getContactInfo(supabase, match);
          matches.push({
            type: 'drop_request',
            data: match,
            match_reason: match.any_section_flexible 
              ? `Wants ${droppedCourse} (any section)` 
              : `Wants ${droppedCourse} section ${match.request_section_number}`,
            match_telegram: dropContactInfo.telegram_username,
            match_full_name: dropContactInfo.full_name
          });
        }
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

            // Get contact info from profiles if missing
            const matchContactInfo = await getContactInfo(supabase, match.data);

            // Create match record - CORRECTED STRUCTURE
            const matchData = {
              requester_user_id: record.user_id,  // The person who dropped (making course available)
              match_user_id: match.data.user_id,  // The person who wants it
              desired_course: droppedCourse,      // The course that was dropped/wanted
              current_section: null,              // Dropper doesn't have a "current" section concept
              desired_section: `${droppedCourse} Section ${droppedSection}`, // What the wanter gets
              normalized_current_section: null,
              normalized_desired_section: `${droppedCourse.toLowerCase()}_${droppedSection}`,
              match_telegram: matchContactInfo.telegram_username,
              match_full_name: matchContactInfo.full_name
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

            // Send ONE consolidated notification to both parties
            await sendConsolidatedMatchNotification(supabase, telegramBotToken, match.data, record, droppedCourse, droppedSection);

          } catch (error) {
            console.error('❌ Error processing match:', error);
          }
        }
      } else {
        console.log('ℹ️ No matches found for dropped course');
      }
    }

    // PART 2: Request-to-Available Matching  
    // When someone makes a request-only, find existing drops that match what they want
    if ((record.action_type === 'request_only' || record.action_type === 'drop_and_request') && 
        record.request_course && record.user_id) {
      
      const requestedCourse = record.request_course.trim();
      const requestedSection = record.request_section_number;
      
      console.log(`🔍 Request-Only: Looking for existing drops of: ${requestedCourse} section ${requestedSection || 'any'}`);
      
      // Find existing processed drop requests that match what this person wants
      let query = supabase
        .from('drop_requests')
        .select('*')
        .or(`drop_course.ilike.%${requestedCourse}%,drop_course.ilike.%${requestedCourse.replace(/\s+/g, '%')}%`)
        .in('action_type', ['drop_only', 'drop_and_request'])
        .neq('user_id', record.user_id)
        .not('processed_at', 'is', null); // Only processed drops

      // Add section filtering based on flexibility
      if (record.any_section_flexible) {
        query = query.not('drop_section_number', 'is', null);
      } else if (requestedSection) {
        query = query.eq('drop_section_number', requestedSection);
      } else {
        query = query.not('drop_section_number', 'is', null);
      }

      const { data: availableDrops, error: dropError } = await query;

      if (dropError) {
        console.error('❌ Error checking available drops:', dropError);
      } else if (availableDrops && availableDrops.length > 0) {
        console.log(`✅ Found ${availableDrops.length} available drops for request-only`);
        
        for (const drop of availableDrops) {
          try {
            // Check for duplicates
            const { data: existingMatch } = await supabase
              .from('matches')
              .select('id')
              .or(`and(requester_user_id.eq.${drop.user_id},match_user_id.eq.${record.user_id}),and(requester_user_id.eq.${record.user_id},match_user_id.eq.${drop.user_id})`)
              .ilike('desired_course', `%${requestedCourse}%`)
              .limit(1);

            if (existingMatch && existingMatch.length > 0) {
              console.log(`⏭️ Request-to-drop match already exists, skipping`);
              continue;
            }

            // Get contact info from profiles if missing
            const dropContactInfo = await getContactInfo(supabase, drop);

            // Create match record for request-to-drop
            const matchData = {
              requester_user_id: drop.user_id,  // The person who dropped 
              match_user_id: record.user_id,     // The person requesting
              desired_course: requestedCourse,
              current_section: null,
              desired_section: `${drop.drop_course} Section ${drop.drop_section_number}`,
              normalized_current_section: null,
              normalized_desired_section: `${drop.drop_course.toLowerCase()}_${drop.drop_section_number}`,
              match_telegram: dropContactInfo.telegram_username,
              match_full_name: dropContactInfo.full_name
            };

            console.log('📝 Creating request-to-drop match:', matchData);

            const { error: matchError } = await supabase
              .from('matches')
              .insert(matchData);

            if (matchError) {
              console.error('❌ Error creating request-to-drop match:', matchError);
            } else {
              console.log('✅ Request-to-drop match created successfully');
              
              // Send consolidated notification
              await sendConsolidatedMatchNotification(
                supabase, 
                telegramBotToken, 
                record, // wanter (requester) 
                drop,   // dropper
                drop.drop_course, 
                drop.drop_section_number
              );
              
              matches.push({
                type: 'request_to_drop',
                data: drop,
                match_reason: `Available drop: ${drop.drop_course} section ${drop.drop_section_number}`,
                match_telegram: dropContactInfo.telegram_username,
                match_full_name: dropContactInfo.full_name
              });
            }
          } catch (error) {
            console.error('❌ Error processing request-to-drop match:', error);
          }
        }
      } else {
        console.log('ℹ️ No available drops found for request-only');
      }
    }

    // PART 2.5: CRITICAL BIDIRECTIONAL MATCHING - Drop-and-Request vs Request-Only  
    // FIX: When someone does drop_and_request, find request_only people who want what they're DROPPING
    if (record.action_type === 'drop_and_request' && record.drop_course) {
      console.log(`🔄 FIXED: Checking if anyone has request_only for what you're DROPPING: ${record.drop_course}`);
      
      let dropMatchQuery = supabase
        .from('drop_requests')
        .select('*')
        .or(`request_course.ilike.%${record.drop_course}%,request_course.ilike.%${record.drop_course.replace(/\s+/g, '%')}%`)
        .eq('action_type', 'request_only')
        .neq('user_id', record.user_id)
        .not('processed_at', 'is', null);

      // Section filtering - match request_only people who want the drop section  
      if (record.drop_section_number) {
        dropMatchQuery = dropMatchQuery.or(`request_section_number.eq.${record.drop_section_number},any_section_flexible.eq.true`);
      }

      const { data: requestOnlyMatches, error: requestError } = await dropMatchQuery;

      if (!requestError && requestOnlyMatches && requestOnlyMatches.length > 0) {
        console.log(`🎯 Found ${requestOnlyMatches.length} request_only people who want what you're dropping!`);
        
        for (const requestOnlyMatch of requestOnlyMatches) {
          try {
            // Check for duplicates
            const { data: existingMatch } = await supabase
              .from('matches')
              .select('id')
              .or(`and(requester_user_id.eq.${record.user_id},match_user_id.eq.${requestOnlyMatch.user_id}),and(requester_user_id.eq.${requestOnlyMatch.user_id},match_user_id.eq.${record.user_id})`)
              .limit(1);

            if (existingMatch && existingMatch.length > 0) {
              console.log(`⏭️ Drop-to-request match already exists, skipping`);
              continue;
            }

            // Get contact info from profiles
            const requestContactInfo = await getContactInfo(supabase, requestOnlyMatch);

            // Create match - dropper has what requester wants
            const dropToRequestMatchData = {
              requester_user_id: record.user_id,
              match_user_id: requestOnlyMatch.user_id,
              desired_course: record.drop_course, // What's being dropped = what they want
              current_section: record.drop_course ? `${record.drop_course} Section ${record.drop_section_number}` : null,
              desired_section: record.request_course ? `${record.request_course} Section ${record.request_section_number || 'any'}` : null,
              normalized_current_section: record.drop_course ? `${record.drop_course.toLowerCase()}_${record.drop_section_number}` : null,
              normalized_desired_section: record.request_course ? `${record.request_course.toLowerCase()}_${record.request_section_number || 'flexible'}` : null,
              match_telegram: requestContactInfo.telegram_username,
              match_full_name: requestContactInfo.full_name
            };

            console.log('📝 Creating drop-to-request match:', dropToRequestMatchData);

            const { error: matchError } = await supabase
              .from('matches')
              .insert(dropToRequestMatchData);

            if (matchError) {
              console.error('❌ Error creating drop-to-request match:', matchError);
            } else {
              console.log('✅ Drop-to-request match created successfully');
              
              matches.push({
                type: 'drop_to_request',
                data: requestOnlyMatch,
                match_reason: `You're dropping ${record.drop_course} which they want`,
                match_telegram: requestContactInfo.telegram_username,
                match_full_name: requestContactInfo.full_name
              });
            }
          } catch (error) {
            console.error('❌ Error processing drop-to-request match:', error);
          }
        }
      } else {
        console.log('ℹ️ No request_only matches found for what you are dropping');
      }
    }

    // PART 2.6: NEW - Drop-and-Request looking for existing drops of what they want
    if (record.action_type === 'drop_and_request' && record.request_course) {
      console.log(`🔄 NEW: Checking for existing drops of what you want: ${record.request_course}`);
      
      let wantedDropsQuery = supabase
        .from('drop_requests')
        .select('*')
        .or(`drop_course.ilike.%${record.request_course}%,drop_course.ilike.%${record.request_course.replace(/\s+/g, '%')}%`)
        .in('action_type', ['drop_only', 'drop_and_request'])
        .neq('user_id', record.user_id)
        .not('processed_at', 'is', null);

      // Section filtering for what they want
      if (record.any_section_flexible) {
        wantedDropsQuery = wantedDropsQuery.not('drop_section_number', 'is', null);
      } else if (record.request_section_number) {
        wantedDropsQuery = wantedDropsQuery.eq('drop_section_number', record.request_section_number);
      }

      const { data: wantedDrops, error: wantedError } = await wantedDropsQuery;

      if (!wantedError && wantedDrops && wantedDrops.length > 0) {
        console.log(`🎯 Found ${wantedDrops.length} drops of what you want!`);
        
        for (const wantedDrop of wantedDrops) {
          try {
            // Check for duplicates
            const { data: existingMatch } = await supabase
              .from('matches')
              .select('id')
              .or(`and(requester_user_id.eq.${record.user_id},match_user_id.eq.${wantedDrop.user_id}),and(requester_user_id.eq.${wantedDrop.user_id},match_user_id.eq.${record.user_id})`)
              .limit(1);

            if (existingMatch && existingMatch.length > 0) {
              console.log(`⏭️ Want-to-drop match already exists, skipping`);
              continue;
            }

            // Get contact info
            const dropContactInfo = await getContactInfo(supabase, wantedDrop);

            // Create match - they have what you want
            const wantToDropMatchData = {
              requester_user_id: record.user_id,
              match_user_id: wantedDrop.user_id,
              desired_course: record.request_course, // What you want
              current_section: record.drop_course ? `${record.drop_course} Section ${record.drop_section_number}` : null,
              desired_section: `${record.request_course} Section ${record.request_section_number || 'any'}`,
              normalized_current_section: record.drop_course ? `${record.drop_course.toLowerCase()}_${record.drop_section_number}` : null,
              normalized_desired_section: `${record.request_course.toLowerCase()}_${record.request_section_number || 'flexible'}`,
              match_telegram: dropContactInfo.telegram_username,
              match_full_name: dropContactInfo.full_name
            };

            console.log('📝 Creating want-to-drop match:', wantToDropMatchData);

            const { error: matchError } = await supabase
              .from('matches')
              .insert(wantToDropMatchData);

            if (matchError) {
              console.error('❌ Error creating want-to-drop match:', matchError);
            } else {
              console.log('✅ Want-to-drop match created successfully');
              
              matches.push({
                type: 'want_to_drop',
                data: wantedDrop,
                match_reason: `They're dropping ${record.request_course} which you want`,
                match_telegram: dropContactInfo.telegram_username,
                match_full_name: dropContactInfo.full_name
              });
            }
          } catch (error) {
            console.error('❌ Error processing want-to-drop match:', error);
          }
        }
      } else {
        console.log('ℹ️ No existing drops found for what you want');
      }
    }

    // PART 3: ENHANCED Swap-to-Drop Cross-Matching
    // Check if anyone in swap_requests has a CURRENT section that matches drop requests
    console.log('🔄 Checking enhanced cross-matching: swap current sections with drop requests...');
    
    // More efficient query - only get relevant swap requests
    const { data: relevantSwapRequests, error: swapFetchError } = await supabase
      .from('swap_requests')
      .select('*')
      .neq('user_id', record.user_id)
      .not('current_section', 'is', null) // Only swaps with current sections
      .limit(50); // Limit to prevent performance issues

    if (swapFetchError) {
      console.error('❌ Error fetching swap requests for cross-matching:', swapFetchError);
    } else if (relevantSwapRequests && relevantSwapRequests.length > 0) {
      console.log(`🔄 Found ${relevantSwapRequests.length} swap requests for cross-matching`);
      
      for (const swapRequest of relevantSwapRequests) {
        // Check multiple cross-matching scenarios
        let shouldCreateMatch = false;
        let matchReason = '';

        // Scenario 1: Drop request wants what swapper currently has
        if (record.request_course && swapRequest.current_section && swapRequest.desired_course) {
          const courseMatch = record.request_course.toLowerCase().includes(swapRequest.desired_course.toLowerCase()) ||
                             swapRequest.desired_course.toLowerCase().includes(record.request_course.toLowerCase());
          
          const sectionMatch = !record.request_section_number || 
                              record.any_section_flexible ||
                              record.request_section_number === swapRequest.current_section_number;
          
          if (courseMatch && sectionMatch) {
            shouldCreateMatch = true;
            matchReason = `Cross-match: You want ${record.request_course}, they have ${swapRequest.desired_course} section ${swapRequest.current_section_number}`;
          }
        }

        // Scenario 2: Swapper wants what's being dropped
        if (record.drop_course && swapRequest.desired_course && record.drop_section_number) {
          const courseMatch = record.drop_course.toLowerCase().includes(swapRequest.desired_course.toLowerCase()) ||
                             swapRequest.desired_course.toLowerCase().includes(record.drop_course.toLowerCase());
          
          const sectionMatch = swapRequest.desired_section_number === record.drop_section_number;
          
          if (courseMatch && sectionMatch) {
            shouldCreateMatch = true;
            matchReason = `Cross-match: You're dropping ${record.drop_course} section ${record.drop_section_number}, they want it`;
          }
        }
        
        // Scenario 3: Drop-only request wants swapper's current section
        if (record.action_type === 'drop_only' && record.request_course && swapRequest.current_section) {
          const courseMatch = record.request_course.toLowerCase().includes(swapRequest.desired_course.toLowerCase()) ||
                             swapRequest.desired_course.toLowerCase().includes(record.request_course.toLowerCase());
          
          const sectionMatch = !record.request_section_number || 
                              record.any_section_flexible ||
                              record.request_section_number === swapRequest.current_section_number;
          
          if (courseMatch && sectionMatch) {
            shouldCreateMatch = true;
            matchReason = `Match: You want ${record.request_course}, they're in ${swapRequest.desired_course} section ${swapRequest.current_section_number}`;
          }
        }
        
        // Scenario 4: Swapper wants what drop-only student is requesting (direct course match)
        if (record.action_type === 'drop_only' && record.request_course && swapRequest.desired_course) {
          const directCourseMatch = record.request_course.toLowerCase().trim() === swapRequest.desired_course.toLowerCase().trim();
          const sectionMatch = !record.request_section_number || 
                              record.any_section_flexible ||
                              record.request_section_number === swapRequest.desired_section_number;
          
          if (directCourseMatch && sectionMatch) {
            shouldCreateMatch = true;
            matchReason = `Direct match: Both want ${record.request_course}`;
          }
        }

        if (shouldCreateMatch) {
          console.log(`🎯 ${matchReason}`);
          
          // Check for duplicates more efficiently
          const { data: existingMatch } = await supabase
            .from('matches')
            .select('id')
            .or(`and(requester_user_id.eq.${record.user_id},match_user_id.eq.${swapRequest.user_id}),and(requester_user_id.eq.${swapRequest.user_id},match_user_id.eq.${record.user_id})`)
            .limit(1);

          if (existingMatch && existingMatch.length > 0) {
            console.log(`⏭️ Cross-match already exists, skipping`);
            continue;
          }

          // Create cross-match record - flexible structure based on scenario
          const courseName = record.drop_course || record.request_course || swapRequest.desired_course;
          const sectionInfo = record.drop_section_number || record.request_section_number || swapRequest.current_section_number;
          
          const crossMatchData = {
            requester_user_id: record.user_id,
            match_user_id: swapRequest.user_id,
            desired_course: courseName,
            current_section: swapRequest.current_section,
            desired_section: `${courseName} Section ${sectionInfo}`,
            normalized_current_section: swapRequest.normalized_current_section,
            normalized_desired_section: `${courseName.toLowerCase()}_${sectionInfo}`,
            match_telegram: swapRequest.telegram_username || null,
            match_full_name: swapRequest.full_name || null
          };

          console.log('📝 Creating cross-match:', crossMatchData);

          const { error: crossMatchError } = await supabase
            .from('matches')
            .insert(crossMatchData);

          if (crossMatchError) {
            console.error('❌ Error creating cross-match:', crossMatchError);
          } else {
            console.log('✅ Cross-match created successfully');
            const swapContactInfo = await getContactInfo(supabase, swapRequest);
            matches.push({
              type: 'cross_match',
              data: swapRequest,
              match_reason: matchReason,
              match_telegram: swapContactInfo.telegram_username,
              match_full_name: swapContactInfo.full_name
            });
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to send ONE consolidated notification to both parties
async function sendConsolidatedMatchNotification(supabase: any, telegramBotToken: string, wanter: any, dropper: any, courseName: string, sectionNumber: number) {
  if (!telegramBotToken) {
    console.log('⏭️ No Telegram bot token available');
    return;
  }

  const escapeMarkdown = (text: string) => text.replace(/[*_`\[\]()~>#+=|{}.!-]/g, '\\$&');
  const courseNameEscaped = escapeMarkdown(courseName);

  // Notification tracking to prevent duplicates
  const notificationId = `match_${dropper.user_id}_${wanter.user_id}_${courseName}_${sectionNumber}`;
  
  // Send to wanter
  if (wanter.telegram_username) {
    try {
      const { data: wanterProfile } = await supabase
        .from('profiles')
        .select('telegram_chat_id')
        .eq('telegram_username', wanter.telegram_username)
        .single();

      if (wanterProfile?.telegram_chat_id) {
        const dropperUsername = escapeMarkdown(dropper.telegram_username || 'Anonymous');
        const wanterMessage = `🎯 *Match Found!*\n\n` +
          `Perfect! Someone is dropping "${courseNameEscaped} Section ${sectionNumber}" that you wanted!\n\n` +
          `👤 Contact: ${dropper.telegram_username ? `@${dropperUsername}` : 'Anonymous user'}\n` +
          `📚 Course: ${courseNameEscaped}\n` +
          `📝 Section: ${sectionNumber}\n\n` +
          `💬 Reach out to coordinate the transfer quickly!`;

        await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: wanterProfile.telegram_chat_id,
            text: wanterMessage,
            parse_mode: 'Markdown'
          })
        });
        console.log('✅ Consolidated notification sent to wanter');
      }
    } catch (error) {
      console.error('❌ Error sending notification to wanter:', error);
    }
  }

  // Send to dropper
  if (dropper.telegram_username) {
    try {
      const { data: dropperProfile } = await supabase
        .from('profiles')
        .select('telegram_chat_id')
        .eq('telegram_username', dropper.telegram_username)
        .single();

      if (dropperProfile?.telegram_chat_id) {
        const wanterUsername = escapeMarkdown(wanter.telegram_username || 'Anonymous');
        const dropperMessage = `📢 *Someone Wants Your Course!*\n\n` +
          `Great news! A student wants the course you're dropping: "${courseNameEscaped} Section ${sectionNumber}"\n\n` +
          `👤 Contact: ${wanter.telegram_username ? `@${wanterUsername}` : 'Anonymous user'}\n` +
          `📚 Course: ${courseNameEscaped}\n` +
          `📝 Section: ${sectionNumber}\n\n` +
          `💬 Coordinate with them to transfer your spot!`;

        await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: dropperProfile.telegram_chat_id,
            text: dropperMessage,
            parse_mode: 'Markdown'
          })
        });
        console.log('✅ Consolidated notification sent to dropper');
      }
    } catch (error) {
      console.error('❌ Error sending notification to dropper:', error);
    }
  }
}

// Enhanced contact info helper function with better fallback logic
async function getContactInfo(supabase: any, user: any) {
  if (!user || !user.user_id) {
    console.log('⚠️ No user or user_id provided to getContactInfo');
    return { telegram_username: null, full_name: null };
  }

  try {
    // First try profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('telegram_username, first_name, last_name')
      .eq('id', user.user_id)
      .single();

    if (error) {
      console.log('⚠️ Profile error for user:', user.user_id, error.message);
    }

    if (profile) {
      const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || null;
      
      return {
        telegram_username: profile.telegram_username || user.telegram_username || null,
        full_name: fullName || user.full_name || null
      };
    }

    // Fallback to original user record data
    console.log('⚠️ Profile not found, using fallback data for user:', user.user_id);
    return { 
      telegram_username: user.telegram_username || null, 
      full_name: user.full_name || user.anonymous ? 'Anonymous User' : null 
    };
  } catch (error) {
    console.error('❌ Error fetching contact info:', error);
    return { 
      telegram_username: user.telegram_username || null, 
      full_name: user.full_name || 'Unknown User'
    };
  }
}