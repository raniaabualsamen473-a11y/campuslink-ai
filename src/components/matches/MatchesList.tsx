
import { Match } from "@/types/swap";
import { CourseMatchGroup } from "./CourseMatchGroup";
import { AlertCircle } from "lucide-react";

interface MatchesListProps {
  groupedMatches: Record<string, Match[]>;
  isLoading: boolean;
}

export const MatchesList = ({ groupedMatches, isLoading }: MatchesListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campus-purple mx-auto mb-3"></div>
        <p className="text-gray-500">Finding potential matches...</p>
      </div>
    );
  }

  if (Object.keys(groupedMatches).length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-gray-50 p-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
          <AlertCircle className="h-6 w-6 text-gray-500" />
        </div>
        <p className="text-gray-700 font-medium">No potential matches found</p>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Submit a class swap request to find students who want to swap with you. 
          The more requests you submit, the more likely you'll find matches!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedMatches).map(([courseName, courseMatches]) => (
        <CourseMatchGroup 
          key={courseName} 
          courseName={courseName} 
          matches={courseMatches} 
        />
      ))}
    </div>
  );
};
