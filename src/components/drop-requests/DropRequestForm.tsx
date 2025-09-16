import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionTypeSelector } from "./ActionTypeSelector";
import { DropCourseSection } from "./DropCourseSection";
import { RequestCourseSection } from "./RequestCourseSection";
import { useDropRequestForm } from "@/hooks/useDropRequestForm";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

interface DropRequestFormProps {
  editingRequestId?: string | null;
  user: any;
  onRequestSubmitted: () => void;
  onCancelEdit: () => void;
}

export const DropRequestForm = ({ editingRequestId, user, onRequestSubmitted, onCancelEdit }: DropRequestFormProps) => {
  const form = useForm();
  
  const {
    formData,
    isSubmitting,
    handleSubmit,
    updateFormData,
    resetForm,
    isEditing,
  } = useDropRequestForm({
    user,
    editingRequestId,
    onRequestSubmitted,
    onCancelEdit,
  });

  const showDropSection = formData.action_type === 'drop_only' || formData.action_type === 'drop_and_request';
  const showRequestSection = formData.action_type === 'request_only' || formData.action_type === 'drop_and_request';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">
              {isEditing ? 'Edit Drop Request' : 'New Drop Request'}
            </CardTitle>
            <CardDescription>
              {isEditing ? 'Update your drop request details' : 'Submit a new drop request'}
            </CardDescription>
          </div>
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel Edit
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ActionTypeSelector
              value={formData.action_type}
              onChange={(value) => updateFormData('action_type', value)}
            />

            {showDropSection && (
              <DropCourseSection
                dropCourse={formData.drop_course}
                dropSectionNumber={formData.drop_section_number}
                onDropCourseChange={(value) => updateFormData('drop_course', value)}
                onDropSectionChange={(value) => updateFormData('drop_section_number', value)}
              />
            )}

            {showRequestSection && (
              <RequestCourseSection
                requestCourse={formData.request_course}
                requestSectionNumber={formData.request_section_number}
                anySectionFlexible={formData.any_section_flexible}
                onRequestCourseChange={(value) => updateFormData('request_course', value)}
                onRequestSectionChange={(value) => updateFormData('request_section_number', value)}
                onFlexibilityChange={(value) => updateFormData('any_section_flexible', value)}
              />
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : (isEditing ? 'Update Request' : 'Submit Request')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};