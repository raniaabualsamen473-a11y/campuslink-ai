
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCcw, Users, BookOpen, Calendar, MessageSquare } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-campus-darkPurple mb-4">
          CampusLink AI
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          The intelligent way to manage your university class schedule, swap sections, and connect with classmates.
        </p>
        
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {user ? (
            <Button 
              onClick={() => navigate("/swap-requests")}
              className="bg-campus-purple hover:bg-campus-darkPurple text-white"
              size="lg"
            >
              <RefreshCcw className="mr-2 h-5 w-5" />
              Swap Classes
            </Button>
          ) : (
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-campus-purple hover:bg-campus-darkPurple text-white"
              size="lg"
            >
              Get Started
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="lg"
            asChild
          >
            <a href="#features">Learn More</a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16" id="features">
        <Card className="border-campus-purple/20 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-campus-purple/10 p-3 mb-4">
                <RefreshCcw className="h-8 w-8 text-campus-purple" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-black">Class Swapping</h2>
              <p className="text-gray-600">
                Easily swap class sections with other students. Submit your request and get automatically matched with compatible swaps.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-campus-purple/20 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-campus-purple/10 p-3 mb-4">
                <Users className="h-8 w-8 text-campus-purple" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-black">Section Petitions</h2>
              <p className="text-gray-600">
                Create petitions for new section openings. Gather support from other students and present united requests to administration.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-campus-purple/20 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-campus-purple/10 p-3 mb-4">
                <MessageSquare className="h-8 w-8 text-campus-purple" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-black">Easy Communication</h2>
              <p className="text-gray-600">
                Connect with matched students via Telegram for seamless communication when arranging your class swaps.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-campus-darkPurple mb-6">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="bg-campus-purple/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-campus-purple">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-black">Create an Account</h3>
            <p className="text-gray-600">
              Sign up with your university email and provide your Telegram username for contact.
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-campus-purple/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-campus-purple">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-black">Submit Your Request</h3>
            <p className="text-gray-600">
              Create a swap request or petition with your current and desired class sections.
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-campus-purple/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-campus-purple">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-black">Get Matched & Connect</h3>
            <p className="text-gray-600">
              Get automatically matched with compatible requests and connect via Telegram to arrange the swap.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-campus-darkPurple mb-6">
          Ready to start swapping classes?
        </h2>
        
        {user ? (
          <Button 
            onClick={() => navigate("/swap-requests")}
            className="bg-campus-purple hover:bg-campus-darkPurple text-white"
            size="lg"
          >
            View Swap Requests
          </Button>
        ) : (
          <Button 
            onClick={() => navigate("/auth")}
            className="bg-campus-purple hover:bg-campus-darkPurple text-white"
            size="lg"
          >
            Sign Up Now
          </Button>
        )}
      </div>
    </div>
  );
};

export default Index;
