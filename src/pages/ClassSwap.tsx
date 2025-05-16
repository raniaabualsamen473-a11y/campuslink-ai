
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import SwapForm from "@/components/classswap/SwapForm";
import SwapBenefits from "@/components/classswap/SwapBenefits";
import SwapInstructions from "@/components/classswap/SwapInstructions";
import { Button } from "@/components/ui/button";
import MatchResults from "@/components/MatchResults";

const ClassSwap = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("swap");

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto text-center glass-card p-8">
          <div className="flex justify-center mb-6">
            <img 
              src="https://pbqpbupsmzafbzlxccov.supabase.co/storage/v1/object/public/logo//CampusLink.ai(Logo)%20(Logo).png" 
              alt="CampusLink AI Logo" 
              className="h-16 w-16 object-contain mb-4"
            />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-foreground">Sign in required</h1>
          <p className="mb-6 text-muted-foreground">You need to sign in or create an account to use ClassSwap.</p>
          <Button 
            onClick={() => navigate("/auth")}
            variant="neon"
            className="btn-glow"
          >
            Sign In / Create Account
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center">
        <div className="animate-glow-pulse rounded-full h-12 w-12 border-2 border-campus-purple"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 text-campus-darkPurple">Class Swap</h1>
        <p className="text-muted-foreground">
          Find students to swap class sections or petition for new sections
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 animate-fade-in" style={{animationDelay: "0.1s"}}>
          <div className="glass-card p-6 hover:shadow-neon-purple transition-all duration-300">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="swap">Submit a Request</TabsTrigger>
                <TabsTrigger value="results">View Matches</TabsTrigger>
              </TabsList>
              
              <TabsContent value="swap">
                <SwapForm />
              </TabsContent>
              
              <TabsContent value="results">
                <MatchResults />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="glass-card p-6 hover:shadow-neon-purple transition-all duration-300 animate-fade-in" style={{animationDelay: "0.2s"}}>
            <SwapBenefits />
          </div>
          <div className="glass-card p-6 hover:shadow-neon-purple transition-all duration-300 animate-fade-in" style={{animationDelay: "0.3s"}}>
            <SwapInstructions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassSwap;
