
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCcw, Users, MessageSquare } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12 animate-fade-in">
        <div className="flex justify-center mb-6">
          <img 
            src="https://pbqpbupsmzafbzlxccov.supabase.co/storage/v1/object/public/logo//CampusLink.ai(Logo)%20(Logo).png" 
            alt="CampusLink AI Logo" 
            className="h-24 w-24 object-contain animate-float"
          />
        </div>
        <h1 className="text-5xl font-bold text-campus-darkPurple mb-4">
          CampusLink <span className="text-campus-purple">AI</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          The intelligent way to manage your university class schedule, swap sections, and connect with classmates.
        </p>
        
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {user ? (
            <Button 
              onClick={() => navigate("/swap-requests")}
              variant="neon"
              size="lg"
              className="btn-glow"
            >
              <RefreshCcw className="mr-2 h-5 w-5" />
              Swap Classes
            </Button>
          ) : (
            <Button 
              onClick={() => navigate("/auth")}
              variant="neon"
              size="lg"
              className="btn-glow"
            >
              Get Started
            </Button>
          )}
          
          <Button 
            variant="glass" 
            size="lg"
            asChild
          >
            <a href="#features">Learn More</a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16" id="features">
        <Card className="hover:shadow-neon-purple transition-all duration-500 animate-fade-in" style={{animationDelay: "0.1s"}}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-campus-purple/10 p-3 mb-4 neon-glow">
                <RefreshCcw className="h-8 w-8 text-campus-purple" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-foreground">Class Swapping</h2>
              <p className="text-muted-foreground">
                Easily swap class sections with other students. Submit your request and get automatically matched with compatible swaps.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-neon-purple transition-all duration-500 animate-fade-in" style={{animationDelay: "0.3s"}}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-campus-purple/10 p-3 mb-4 neon-glow">
                <Users className="h-8 w-8 text-campus-purple" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-foreground">Section Petitions</h2>
              <p className="text-muted-foreground">
                Create petitions for new section openings. Gather support from other students and present united requests to administration.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-neon-purple transition-all duration-500 animate-fade-in" style={{animationDelay: "0.5s"}}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-campus-purple/10 p-3 mb-4 neon-glow">
                <MessageSquare className="h-8 w-8 text-campus-purple" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-foreground">Easy Communication</h2>
              <p className="text-muted-foreground">
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
          <div className="flex flex-col items-center animate-fade-in" style={{animationDelay: "0.2s"}}>
            <div className="bg-campus-purple/10 rounded-full w-12 h-12 flex items-center justify-center mb-4 neon-glow">
              <span className="text-xl font-bold text-campus-purple">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Create an Account</h3>
            <p className="text-muted-foreground">
              Sign up with your university email and provide your Telegram username for contact.
            </p>
          </div>
          
          <div className="flex flex-col items-center animate-fade-in" style={{animationDelay: "0.4s"}}>
            <div className="bg-campus-purple/10 rounded-full w-12 h-12 flex items-center justify-center mb-4 neon-glow">
              <span className="text-xl font-bold text-campus-purple">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Submit Your Request</h3>
            <p className="text-muted-foreground">
              Create a swap request or petition with your current and desired class sections.
            </p>
          </div>
          
          <div className="flex flex-col items-center animate-fade-in" style={{animationDelay: "0.6s"}}>
            <div className="bg-campus-purple/10 rounded-full w-12 h-12 flex items-center justify-center mb-4 neon-glow">
              <span className="text-xl font-bold text-campus-purple">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Get Matched & Connect</h3>
            <p className="text-muted-foreground">
              Get automatically matched with compatible requests and connect via Telegram to arrange the swap.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center glass py-8 px-4 rounded-3xl backdrop-blur-md animate-fade-in" style={{animationDelay: "0.8s"}}>
        <h2 className="text-2xl font-bold text-campus-darkPurple mb-6">
          Ready to start swapping classes?
        </h2>
        
        {user ? (
          <Button 
            onClick={() => navigate("/swap-requests")}
            variant="neon"
            size="lg"
            className="btn-glow"
          >
            View Swap Requests
          </Button>
        ) : (
          <Button 
            onClick={() => navigate("/auth")}
            variant="neon"
            size="lg"
            className="btn-glow"
          >
            Sign Up Now
          </Button>
        )}
      </div>
    </div>
  );
};

export default Index;
