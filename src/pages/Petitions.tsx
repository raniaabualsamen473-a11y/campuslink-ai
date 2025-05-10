
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Petitions = () => {
  const activePetitions = [
    {
      id: 1,
      course: "Machine Learning",
      requestedSection: "Section 4 (Sun/Tue/Thu 4:00 PM)",
      supporters: 18,
      requiredSupporters: 20,
      progress: 90,
      dateCreated: "2025-05-06",
      isSupported: true,
    },
    {
      id: 2,
      course: "Advanced Algorithms",
      requestedSection: "Section 3 (Mon/Wed 1:00 PM)",
      supporters: 12,
      requiredSupporters: 20,
      progress: 60,
      dateCreated: "2025-05-04",
      isSupported: false,
    },
    {
      id: 3,
      course: "Web Development",
      requestedSection: "Section 2 (Sun/Tue/Thu 10:00 AM)",
      supporters: 8,
      requiredSupporters: 20,
      progress: 40,
      dateCreated: "2025-05-03",
      isSupported: false,
    },
  ];

  const completedPetitions = [
    {
      id: 4,
      course: "Database Systems",
      requestedSection: "Section 3 (Sun/Tue/Thu 9:00 AM)",
      supporters: 23,
      requiredSupporters: 20,
      progress: 100,
      dateCreated: "2025-04-28",
      dateCompleted: "2025-05-02",
      status: "Submitted to Faculty",
    },
  ];

  const handleSupportPetition = (petitionId: number) => {
    toast.success("You've successfully supported this petition!");
  };

  const handleSubmitPetition = (petitionId: number) => {
    toast.success("Petition has been generated and sent to faculty!");
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
            {activePetitions.map((petition) => (
              <Card key={petition.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-campus-blue">
                    {petition.course}
                  </CardTitle>
                  <CardDescription>
                    {petition.requestedSection}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Progress</span>
                        <span>{petition.supporters}/{petition.requiredSupporters} supporters</span>
                      </div>
                      <Progress value={petition.progress} />
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <p>Created: {petition.dateCreated}</p>
                      {petition.progress >= 100 && (
                        <p className="text-green-600 font-medium mt-1">
                          Ready for submission!
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {petition.isSupported ? (
                    <Button variant="outline" disabled className="w-full">
                      Already Supported
                    </Button>
                  ) : petition.progress >= 100 ? (
                    <Button 
                      className="w-full" 
                      onClick={() => handleSubmitPetition(petition.id)}
                    >
                      Generate Petition Form
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleSupportPetition(petition.id)}
                    >
                      Support Petition
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedPetitions.map((petition) => (
              <Card key={petition.id} className="border-green-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl text-campus-blue">
                      {petition.course}
                    </CardTitle>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </div>
                  <CardDescription>
                    {petition.requestedSection}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Final Count</span>
                        <span>{petition.supporters}/{petition.requiredSupporters} supporters</span>
                      </div>
                      <Progress value={petition.progress} className="bg-green-100" />
                    </div>
                    
                    <div className="text-sm">
                      <p className="text-gray-500">Created: {petition.dateCreated}</p>
                      <p className="text-gray-500">Completed: {petition.dateCompleted}</p>
                      <p className="text-green-600 font-medium mt-1">
                        Status: {petition.status}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Petition Form
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {completedPetitions.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No completed petitions yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Petitions will appear here once they reach the required number of supporters
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-campus-blue mb-4">How Petitions Work</h2>
          <p className="text-gray-600 mb-6">
            When 20 or more students request the same class section, our system automatically
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
