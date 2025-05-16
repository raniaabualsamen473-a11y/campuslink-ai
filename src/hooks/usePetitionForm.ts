
import { useState } from "react";
import { toast } from "sonner";
import { checkExistingPetition, submitPetition } from "@/utils/petitionUtils";

type UsePetitionFormOptions = {
  userId: string;
  userMetadata: any;
  onSuccess: () => void;
};

export const usePetitionForm = ({
  userId,
  userMetadata,
  onSuccess
}: UsePetitionFormOptions) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePetitionSubmit = async ({
    courseName,
    sectionNumber,
    daysPattern,
    startTime,
    semester,
    summerFormat,
    isAnonymous,
    telegramUsername,
    reason
  }: {
    courseName: string;
    sectionNumber: string;
    daysPattern: string;
    startTime: string;
    semester: string;
    summerFormat: string | null;
    isAnonymous: boolean;
    telegramUsername: string;
    reason: string;
  }) => {
    if (!userId) {
      toast.error("You must be logged in to submit a petition");
      return false;
    }

    setIsLoading(true);

    try {
      // Check if user already submitted this petition
      const petitionExists = await checkExistingPetition(
        userId,
        courseName,
        daysPattern,
        semester,
        semester === 'summer' ? summerFormat : null
      );
      
      if (petitionExists) {
        toast.error("You've already submitted this petition", {
          description: "Each student can only support a specific petition once"
        });
        return false;
      }
      
      // Prepare petition data
      const petitionData = {
        course_name: courseName,
        section_number: sectionNumber ? parseInt(sectionNumber) : null,
        days_pattern: daysPattern,
        start_time: startTime,
        semester_type: semester,
        summer_format: semester === 'summer' ? summerFormat : null,
        anonymous: isAnonymous,
        telegram_username: isAnonymous ? null : telegramUsername,
        full_name: isAnonymous ? null : userMetadata?.full_name,
        email: isAnonymous ? null : userId,
        university_id: userMetadata?.university_id
      };
      
      // Submit petition
      const success = await submitPetition(userId, petitionData);
      
      if (success) {
        onSuccess();
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Error submitting petition:", error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handlePetitionSubmit
  };
};
