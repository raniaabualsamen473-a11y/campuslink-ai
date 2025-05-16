
import { Alert } from "@/components/ui/alert";
import { HelpCircle } from "lucide-react";

interface PetitionReasonFieldProps {
  reason: string;
  setReason: (value: string) => void;
}

export const PetitionReasonField = ({
  reason,
  setReason
}: PetitionReasonFieldProps) => {
  // Since we're removing the text box, we'll silently set reason to a default value
  // This maintains compatibility with the existing form logic
  if (!reason) {
    setReason("Student needs this section based on schedule constraints");
  }
  
  return (
    <div className="space-y-2">
      <Alert className="bg-amber-50 border-amber-200">
        <div className="flex items-start">
          <HelpCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800">
              Your petition will be grouped with other students requesting the same course and schedule.
              When 20 students request the same class section, we'll automatically generate a formal petition.
            </p>
          </div>
        </div>
      </Alert>
    </div>
  );
};
