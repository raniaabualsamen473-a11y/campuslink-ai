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

  const getSubmitButtonText = () => {
    if (formData.action_type === 'drop_only') {
      return 'Submit Drop';
    }
    return 'Submit Request';
  };

  return (
    <Card className="w-full border-2 border-purple-500/20 bg-gradient-to-br from-purple-900/5 to-blue-900/5 backdrop-blur-sm shadow-2xl shadow-purple-500/10">
      <CardHeader className="border-b border-purple-500/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {isEditing ? 'Edit Drop Request' : 'New Drop Request'}
            </CardTitle>
            <CardDescription className="text-purple-300/80">
              {isEditing ? 'Update your drop request details' : 'Submit a new drop request'}
            </CardDescription>
          </div>
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
              className="flex items-center gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400/50"
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
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
              >
                {isSubmitting ? 'Submitting...' : (isEditing ? 'Update Request' : getSubmitButtonText())}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};