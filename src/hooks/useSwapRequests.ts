
import { useState, useEffect } from "react";
import { SwapRequest } from "@/types/swap";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSwapRequests(userId: string | undefined) {
  const [activeRequests, setActiveRequests] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (userId) {
      fetchUserRequests();
    }
  }, [userId, refreshTrigger]);

  const fetchUserRequests = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setActiveRequests(data as SwapRequest[] || []);
    } catch (error: any) {
      console.error("Error fetching user requests:", error);
      toast.error("Failed to load your requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('swap_requests')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(`Request canceled successfully!`);
      refreshRequests();
    } catch (error: any) {
      console.error("Error deleting request:", error);
      toast.error(error.message || "Error canceling request");
    }
  };
  
  const handleEditRequest = async (id: string) => {
    try {
      const requestToEdit = activeRequests.find(req => req.id === id);
      if (!requestToEdit) {
        toast.error("Request not found");
        return;
      }
      
      setEditingRequestId(id);
      
      toast(`Editing request`, {
        description: "You can now modify your request and resubmit it."
      });
      
      // Scroll to form
      document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" });
    } catch (error: any) {
      console.error("Error preparing edit:", error);
      toast.error("Error preparing to edit request");
    }
  };

  const refreshRequests = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const cancelEditing = () => {
    setEditingRequestId(null);
  };

  return {
    activeRequests,
    isLoading,
    editingRequestId,
    refreshTrigger,
    handleDeleteRequest,
    handleEditRequest,
    refreshRequests,
    cancelEditing
  };
}
