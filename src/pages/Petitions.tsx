
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePetitions, PETITION_THRESHOLD } from "@/hooks/usePetitions";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

const Petitions = () => {
  const { 
    activePetitions, 
    completedPetitions, 
    isLoading,
    supportPetition,
    isUserSupporting,
    generatePetitionForm,
    refreshPetitions
  } = usePetitions();
  const { session } = useAuth();

  // Refresh petitions when the component mounts
  useEffect(() => {
    refreshPetitions();
  }, []);

  const handleSupportPetition = (petition: any) => {
    supportPetition(petition);
  };

  const handleSubmitPetition = (petition: any) => {
    generatePetitionForm(petition);
  };

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

  const renderPetitionTime = (petition: any) => {
    // This would normally use the petition's created_at time
    // For now, we'll just display "Recent"
    return "Recent";
  };

  const renderPetitionCards = (petitions: any[], completed = false) => {
    if (isLoading) {
      return Array(3).fill(0).map((_, i) => (
        <Card key={`skeleton-${i}`} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
              <Skeleton className="h-4 w-1/3" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ));
    }

    if (petitions.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500">
            {completed 
              ? "No completed petitions yet" 
              : "No active petitions yet"
            }
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {completed
              ? "Petitions will appear here once they reach 20 supporters"
              : "Start a petition by creating a new petition request"
            }
          </p>
          {!completed && (
            <Button asChild variant="outline" className="mt-4">
              <a href="/swap-requests">Create a Petition</a>
            </Button>
          )}
        </div>
      );
    }

    return petitions.map((petition) => {
      const progress = Math.min(100, (petition.supporter_count / PETITION_THRESHOLD) * 100);
      const isSupported = isUserSupporting(petition.id);

      return (
        <Card key={petition.id} className={`hover:shadow-md transition-shadow ${completed ? 'border-green-200' : ''}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl text-campus-blue">
                {petition.course_name}
              </CardTitle>
              {completed && (
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
                <Progress value={progress} className={completed ? "bg-green-100" : ""} />
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Created: {renderPetitionTime(petition)}</p>
                {petition.supporter_count >= PETITION_THRESHOLD && !completed && (
                  <p className="text-green-600 font-medium mt-1">
                    Ready for submission!
                  </p>
                )}
                {completed && (
                  <p className="text-green-600 font-medium mt-1">
                    Status: Submitted to Faculty
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {completed ? (
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
                onClick={() => handleSubmitPetition(petition)}
              >
                Generate Petition Form
              </Button>
            ) : (
              <Button 
                className="w-full"
                disabled={!session}
                onClick={() => handleSupportPetition(petition)}
              >
                {session ? "Support Petition" : "Sign In to Support"}
              </Button>
            )}
          </CardFooter>
        </Card>
      );
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Section Petitions</h1>
        <p className="text-gray-600">
          Support and track petitions for new class sections
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid grid-cols-2 max-w-sm mb-6">
          <TabsTrigger value="active">Active Petitions</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderPetitionCards(activePetitions)}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderPetitionCards(completedPetitions, true)}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-campus-blue mb-4">How Petitions Work</h2>
          <p className="text-gray-600 mb-6">
            When {PETITION_THRESHOLD} or more students request the same class section, our system automatically
            generates a Google Form petition that can be submitted to faculty members
            requesting a new section based on student demand.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild variant="outline">
              <a href="/swap-requests">Create a Petition</a>
            </Button>
            <Button variant="secondary">Learn More</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Petitions;
