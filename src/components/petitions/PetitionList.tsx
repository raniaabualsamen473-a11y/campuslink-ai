
import { PetitionCard } from "./PetitionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

type PetitionListProps = {
  petitions: any[];
  isLoading: boolean;
  isCompleted?: boolean;
  isUserSupporting: (id: string) => boolean;
  supportPetition: (petition: any) => void;
  generatePetitionForm: (petition: any) => void;
  session: any;
};

export const PetitionList = ({
  petitions,
  isLoading,
  isCompleted = false,
  isUserSupporting,
  supportPetition,
  generatePetitionForm,
  session
}: PetitionListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
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
        ))}
      </div>
    );
  }

  if (petitions.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-gray-500">
          {isCompleted 
            ? "No completed petitions yet" 
            : "No active petitions yet"
          }
        </p>
        <p className="text-sm text-gray-400 mt-2">
          {isCompleted
            ? "Petitions will appear here once they reach 20 supporters"
            : "Start a petition by creating a new petition request"
          }
        </p>
        {!isCompleted && (
          <Button asChild variant="outline" className="mt-4">
            <a href="/swap-requests">Create a Petition</a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {petitions.map((petition) => (
        <PetitionCard
          key={petition.id}
          petition={petition}
          isCompleted={isCompleted}
          isUserSupporting={isUserSupporting}
          onSupport={supportPetition}
          onSubmit={generatePetitionForm}
          isSession={!!session}
        />
      ))}
    </div>
  );
};
