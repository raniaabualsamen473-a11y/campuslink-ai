
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
          <LoadingSpinner size="sm" color="white" />
          <span className="ml-2">{loadingText}</span>
        </span>
      ) : (
        <>{text}</>
      )}
    </Button>
  );
};
