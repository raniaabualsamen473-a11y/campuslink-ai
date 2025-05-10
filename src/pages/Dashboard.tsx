
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const userStats = {
    activeSwapRequests: 2,
    matches: 1,
    completedSwaps: 3,
    joinedPetitions: 1,
  };

  const upcomingMatches = [
    {
      id: 1,
      course: "Machine Learning",
      currentSection: "Section 1 (Mon/Wed 10:00 AM)",
      targetSection: "Section 2 (Sun/Tue/Thu 2:00 PM)",
      matchedWith: "Sarah Johnson",
      status: "Pending Confirmation",
    },
  ];

  const activePetitions = [
    {
      id: 1,
      course: "Advanced Algorithms",
      requestedSection: "New section (Sun/Tue/Thu 11:00 AM)",
      supporters: 18,
      requiredSupporters: 20,
      progress: 90,
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, Student!</h1>
        <p className="text-gray-600">
          Here's an overview of your class swap activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Active Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userStats.activeSwapRequests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userStats.matches}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Completed Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userStats.completedSwaps}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Joined Petitions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userStats.joinedPetitions}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Matches Section */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Your Matches</CardTitle>
            <CardDescription>
              Students who want to swap with you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <div key={match.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-campus-blue">
                        {match.course}
                      </h3>
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        {match.status}
                      </span>
                    </div>
                    <p className="text-sm mb-1">
                      <span className="text-gray-500">You have: </span>
                      {match.currentSection}
                    </p>
                    <p className="text-sm mb-3">
                      <span className="text-gray-500">You want: </span>
                      {match.targetSection}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm">
                        <span className="text-gray-500">Matched with: </span>
                        {match.matchedWith}
                      </p>
                      <Button size="sm">Contact</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-2">No matches found yet</p>
                <p className="text-sm text-gray-400">
                  We'll notify you when someone wants to swap with you
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/swap-requests">View All Requests</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Active Petitions Section */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Active Petitions</CardTitle>
            <CardDescription>
              New section requests with growing support
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activePetitions.length > 0 ? (
              <div className="space-y-4">
                {activePetitions.map((petition) => (
                  <div key={petition.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-campus-blue mb-1">
                      {petition.course}
                    </h3>
                    <p className="text-sm mb-2">
                      <span className="text-gray-500">Requested: </span>
                      {petition.requestedSection}
                    </p>
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-campus-teal h-2.5 rounded-full"
                          style={{ width: `${petition.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>
                          {petition.supporters}/{petition.requiredSupporters} supporters
                        </span>
                        <span>{petition.progress}% complete</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full">Support Petition</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-2">No active petitions</p>
                <p className="text-sm text-gray-400">
                  Create or join petitions for new class sections
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/petitions">View All Petitions</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button asChild size="lg" className="w-full">
            <Link to="/swap-requests">Create Swap Request</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/petitions">Create Petition</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
