
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PETITION_THRESHOLD } from "@/hooks/usePetitions";

type PetitionCardProps = {
  petition: any;
  isCompleted?: boolean;
  isUserSupporting: (id: string) => boolean;
  onSupport: (petition: any) => void;
  onSubmit: (petition: any) => void;
  isSession: boolean;
};

export const PetitionCard = ({
  petition,
  isCompleted = false,
  isUserSupporting,
  onSupport,
  onSubmit,
  isSession,
}: PetitionCardProps) => {
  const progress = Math.min(100, (petition.supporter_count / PETITION_THRESHOLD) * 100);
  const isSupported = isUserSupporting(petition.id);

  const renderSection = (petition: any) => {
    if (petition.semester_type === 'regular' && petition.days_pattern) {
      let pattern = petition.days_pattern === 'stt' 
        ? 'Sun/Tue/Thu' 
        : petition.days_pattern === 'mw' 
          ? 'Mon/Wed'
          : petition.days_pattern;
          
      return `${pattern} ${petition.start_time || ''}`.trim();
    } else if (petition.summer_format) {
      return petition.summer_format === 'everyday'
        ? 'Every Day' 
        : petition.summer_format;
    }
    return '';
  };

  const renderPetitionTime = () => {
    // This would normally use the petition's created_at time
    // For now, we'll just display "Recent"
    return "Recent";
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${isCompleted ? 'border-green-200' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl text-campus-blue">
            {petition.course_name}
          </CardTitle>
          {isCompleted && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Completed
            </span>
          )}
        </div>
        <CardDescription>
          {`Section Request: ${renderSection(petition)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Progress</span>
              <span>{petition.supporter_count}/{PETITION_THRESHOLD} supporters</span>
            </div>
            <Progress value={progress} className={isCompleted ? "bg-green-100" : ""} />
          </div>
          
          <div className="text-sm text-gray-500">
            <p>Created: {renderPetitionTime()}</p>
            {petition.supporter_count >= PETITION_THRESHOLD && !isCompleted && (
              <p className="text-green-600 font-medium mt-1">
                Ready for submission!
              </p>
            )}
            {isCompleted && (
              <p className="text-green-600 font-medium mt-1">
                Status: Submitted to Faculty
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isCompleted ? (
          <Button variant="outline" className="w-full">
            View Petition Form
          </Button>
        ) : isSupported ? (
          <Button variant="outline" disabled className="w-full">
            Already Supported
          </Button>
        ) : progress >= 100 ? (
          <Button 
            className="w-full" 
            onClick={() => onSubmit(petition)}
          >
            Generate Petition Form
          </Button>
        ) : (
          <Button 
            className="w-full"
            disabled={!isSession}
            onClick={() => onSupport(petition)}
          >
            {isSession ? "Support Petition" : "Sign In to Support"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
