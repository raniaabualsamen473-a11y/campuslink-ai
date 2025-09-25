import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SecureDropRequest {
  id: string;
  user_id: string;
  profile_id?: string | null;
  action_type: 'drop_only' | 'request_only' | 'drop_and_request';
  
  // Drop fields
  drop_course?: string | null;
  drop_section_number?: number | null;
  
  // Request fields  
  request_course?: string | null;
  request_section_number?: number | null;
  any_section_flexible: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
  anonymous: boolean;
  
  // Personal info - only visible to request owner
  telegram_username?: string | null;
  full_name?: string | null;
}

export const useDropRequestsSecure = (currentUserId: string | undefined) => {
  const [requests, setRequests] = useState<SecureDropRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSecureDropRequests = async () => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    try {
      // Fetch drop requests with security filtering
      const { data, error } = await supabase
        .from('drop_requests')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching secure drop requests:", error);
        toast.error("Failed to load drop requests");
        return;
      }

      // Filter results to ensure personal info is only shown for owned requests
      const secureData = data?.map(request => {
        const isOwner = request.user_id === currentUserId || request.profile_id === currentUserId;
        
        return {
          ...request,
          // Hide personal information if not the owner
          telegram_username: isOwner ? request.telegram_username : null,
          full_name: isOwner ? request.full_name : null,
        } as SecureDropRequest;
      }) || [];

      setRequests(secureData);
    } catch (error) {
      console.error("Error in fetchSecureDropRequests:", error);
      toast.error("Failed to load drop requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchSecureDropRequests();
    }
  }, [currentUserId]);

  return {
    requests,
    isLoading,
    refetch: fetchSecureDropRequests
  };
};