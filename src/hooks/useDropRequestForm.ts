import { useState, useEffect } from "react";
import { ActionType, DropRequest, DropRequestFormData } from "@/types/drop";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateDropRequestFields, checkForCrossEnrollmentConflict, checkForDuplicateDropRequest } from "@/utils/dropValidationUtils";

interface UseDropRequestFormProps {
  user: any;
  editingRequestId?: string | null;
  onRequestSubmitted: () => void;
  onCancelEdit: () => void;
}

export const useDropRequestForm = ({ user, editingRequestId, onRequestSubmitted, onCancelEdit }: UseDropRequestFormProps) => {
  const [formData, setFormData] = useState<DropRequestFormData>({
    action_type: 'drop_only',
    drop_course: '',
    drop_section_number: '',
    request_course: '',
    request_section_number: '',
    any_section_flexible: false,
    telegram_username: '',
    anonymous: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize user data
  useEffect(() => {
    if (user && !editingRequestId) {
      setFormData(prev => ({
        ...prev,
        telegram_username: user.telegram_username || '',
      }));
    }
  }, [user, editingRequestId]);

  // Load editing request data
  useEffect(() => {
    if (editingRequestId) {
      loadRequestData(editingRequestId);
    } else {
      resetForm();
    }
  }, [editingRequestId]);

  const loadRequestData = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('drop_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          action_type: data.action_type as ActionType,
          drop_course: data.drop_course || '',
          drop_section_number: data.drop_section_number?.toString() || '',
          request_course: data.request_course || '',
          request_section_number: data.request_section_number?.toString() || '',
          any_section_flexible: data.any_section_flexible || false,
          telegram_username: data.telegram_username || '',
          anonymous: data.anonymous || false,
        });
      }
    } catch (error) {
      console.error("Error loading request data:", error);
      toast.error("Failed to load request data");
    }
  };

  const resetForm = () => {
    setFormData({
      action_type: 'drop_only',
      drop_course: '',
      drop_section_number: '',
      request_course: '',
      request_section_number: '',
      any_section_flexible: false,
      telegram_username: user?.telegram_username || '',
      anonymous: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    // Validate fields
    const validationError = validateDropRequestFields(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Check cross-enrollment conflict for request_only and drop_and_request
    if ((formData.action_type === 'request_only' || formData.action_type === 'drop_and_request') && formData.request_course) {
      const crossEnrollmentError = await checkForCrossEnrollmentConflict(
        user.id,
        formData.request_course,
        formData.request_section_number || undefined
      );
      if (crossEnrollmentError) {
        toast.error(crossEnrollmentError);
        return;
      }
    }

    // Check for duplicates
    const duplicateError = await checkForDuplicateDropRequest(
      user.id,
      formData.action_type,
      formData.drop_course || undefined,
      formData.drop_section_number || undefined,
      formData.request_course || undefined,
      formData.request_section_number || undefined,
      editingRequestId || undefined
    );
    if (duplicateError) {
      toast.error(duplicateError);
      return;
    }

    try {
      setIsSubmitting(true);

      const requestData = {
        user_id: user.id,
        action_type: formData.action_type,
        drop_course: (formData.action_type === 'drop_only' || formData.action_type === 'drop_and_request') ? formData.drop_course : null,
        drop_section_number: (formData.action_type === 'drop_only' || formData.action_type === 'drop_and_request') ? parseInt(formData.drop_section_number) : null,
        request_course: (formData.action_type === 'request_only' || formData.action_type === 'drop_and_request') ? formData.request_course : null,
        request_section_number: (formData.action_type === 'request_only' || formData.action_type === 'drop_and_request') && !formData.any_section_flexible ? parseInt(formData.request_section_number) : null,
        any_section_flexible: (formData.action_type === 'request_only' || formData.action_type === 'drop_and_request') ? formData.any_section_flexible : false,
        telegram_username: formData.telegram_username,
        anonymous: formData.anonymous,
        full_name: formData.anonymous ? null : user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null,
        profile_id: user.id,
      };

      if (editingRequestId) {
        const { error } = await supabase
          .from('drop_requests')
          .update(requestData)
          .eq('id', editingRequestId);

        if (error) throw error;
        toast.success("Drop request updated successfully!");
        onCancelEdit();
      } else {
        const { error } = await supabase
          .from('drop_requests')
          .insert(requestData);

        if (error) throw error;
        toast.success("Drop request submitted successfully!");
      }

      resetForm();
      onRequestSubmitted();

    } catch (error: any) {
      console.error("Error submitting drop request:", error);
      toast.error(error.message || "Failed to submit drop request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof DropRequestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    isSubmitting,
    handleSubmit,
    updateFormData,
    resetForm: () => {
      resetForm();
      onCancelEdit();
    },
    isEditing: !!editingRequestId,
  };
};