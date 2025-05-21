
import { Button } from "@/components/ui/button";

interface ProfileSubmitButtonProps {
  isSubmitting: boolean;
  text: string;
  loadingText: string;
}

export const ProfileSubmitButton = ({ isSubmitting, text, loadingText }: ProfileSubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      variant="neon"
      className="w-full btn-glow"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <span className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          {loadingText}
        </span>
      ) : (
        <>{text}</>
      )}
    </Button>
  );
};
