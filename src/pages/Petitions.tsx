
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

      <PetitionInfo />
    </div>
  );
};

export default Petitions;
