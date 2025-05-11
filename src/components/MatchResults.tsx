
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Sample matches data type
interface Match {
  id: number;
  course: string;
  currentSection: string | null;
  desiredSection: string;
  user: string;
  isAnonymous: boolean;
  matchPercent: number;
  type: "swap" | "petition";
  dateCreated: string;
  user_id: string;
  telegram_username: string | null;
}

const MatchResults = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would use actual data from Supabase
      // This is just a mock implementation for demonstration
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .neq('user_id', user?.id || '')
        .limit(5);
      
      if (error) throw error;
      
      // Transform the real data to match expected format
      const transformedMatches = data.map((item: any, index: number) => ({
        id: item.id,
        course: item.desired_course || "Unknown Course",
        currentSection: item.current_section || null,
        desiredSection: item.desired_section || "Unknown Section",
        user: item.anonymous ? "Anonymous" : (item.full_name || "Unknown"),
        isAnonymous: item.anonymous || false,
        matchPercent: Math.floor(Math.random() * 30) + 70, // Mock match percentage
        type: item.petition ? "petition" : "swap",
        dateCreated: new Date(item.created_at).toISOString().split('T')[0],
        user_id: item.user_id,
        telegram_username: item.telegram_username,
      }));
      
      setMatches(transformedMatches);
    } catch (error: any) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load matches");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = (match: Match) => {
    // In a real app, this would contact the user or show contact info
    toast.success(`Contact information for ${match.course} swap`, {
      description: `Telegram: ${match.telegram_username || "Not provided"}`,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Finding Matches...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campus-purple"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-black">Potential Matches</CardTitle>
        <CardDescription>
          Students who might be able to swap with you
        </CardDescription>
      </CardHeader>
      <CardContent>
        {matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="border rounded-lg p-4 hover:border-campus-purple transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-black">{match.course}</h3>
                  <Badge className={match.matchPercent >= 90 ? "bg-green-600" : "bg-yellow-600"}>
                    {match.matchPercent}% Match
                  </Badge>
                </div>
                {match.type === "swap" ? (
                  <>
                    <p className="text-sm mb-1 text-gray-700">
                      <span className="text-gray-500">From: </span>
                      {match.currentSection || "Any Section"}
                    </p>
                    <p className="text-sm mb-2 text-gray-700">
                      <span className="text-gray-500">To: </span>
                      {match.desiredSection}
                    </p>
                  </>
                ) : (
                  <p className="text-sm mb-2 text-gray-700">
                    <span className="text-gray-500">Looking for: </span>
                    {match.desiredSection}
                  </p>
                )}
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-500">
                    Posted by: {match.user}
                  </span>
                  <Button
                    size="sm"
                    className="bg-campus-purple hover:bg-campus-darkPurple"
                    onClick={() => handleContact(match)}
                  >
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No matches found</p>
            <p className="text-sm text-gray-400 mt-2">
              Try submitting a new swap request
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchResults;
