
import { Match } from "@/types/swap";
import { CourseMatchGroup } from "./CourseMatchGroup";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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

  const totalMatches = Object.values(groupedMatches).flat().length;

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
      {totalMatches > 0 && (
        <div className="flex items-center gap-2 bg-green-50 p-3 rounded-md text-green-800 border border-green-200 mb-4">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm">Found {totalMatches} potential {totalMatches === 1 ? 'match' : 'matches'} across {Object.keys(groupedMatches).length} {Object.keys(groupedMatches).length === 1 ? 'course' : 'courses'}</span>
        </div>
      )}
      {Object.entries(groupedMatches)
        .sort(([, matchesA], [, matchesB]) => matchesB.length - matchesA.length) // Sort by match count
        .map(([courseName, courseMatches]) => (
          <CourseMatchGroup 
            key={courseName} 
            courseName={courseName} 
            matches={courseMatches} 
          />
        ))}
    </div>
  );
};
