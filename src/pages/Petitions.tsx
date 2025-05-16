
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePetitions } from "@/hooks/usePetitions";
import { useAuth } from "@/hooks/useAuth";
import { PetitionList } from "@/components/petitions/PetitionList";
import { PetitionInfo } from "@/components/petitions/PetitionInfo";

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

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 text-campus-darkPurple bg-gradient-to-r from-campus-neonPurple to-campus-lightPurple bg-clip-text text-transparent">
          Section Petitions
        </h1>
        <p className="text-muted-foreground">
          Support and track petitions for new class sections
        </p>
      </div>

      <div className="glass-card p-6 hover:shadow-neon-purple transition-all duration-300 animate-fade-in" style={{animationDelay: "0.1s"}}>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid grid-cols-2 max-w-sm mb-6">
            <TabsTrigger value="active">Active Petitions</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <PetitionList
              petitions={activePetitions}
              isLoading={isLoading}
              isUserSupporting={isUserSupporting}
              supportPetition={supportPetition}
              generatePetitionForm={generatePetitionForm}
              session={session}
            />
          </TabsContent>

          <TabsContent value="completed">
            <PetitionList
              petitions={completedPetitions}
              isLoading={isLoading}
              isCompleted={true}
              isUserSupporting={isUserSupporting}
              supportPetition={supportPetition}
              generatePetitionForm={generatePetitionForm}
              session={session}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-8 animate-fade-in" style={{animationDelay: "0.2s"}}>
        <div className="glass-card p-6 hover:shadow-neon-purple transition-all duration-300">
          <PetitionInfo />
        </div>
      </div>
    </div>
  );
};

export default Petitions;
