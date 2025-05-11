
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
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4 text-black">Sign in required</h1>
          <p className="mb-6 text-black">You need to sign in or create an account to use ClassSwap.</p>
          <Button 
            onClick={() => navigate("/auth")}
            className="bg-campus-purple hover:bg-campus-darkPurple"
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-campus-purple"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-black">Class Swap</h1>
        <p className="text-gray-700">
          Find students to swap class sections or petition for new sections
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
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
        
        <div className="space-y-6">
          <SwapBenefits />
          <SwapInstructions />
        </div>
      </div>
    </div>
  );
};

export default ClassSwap;
