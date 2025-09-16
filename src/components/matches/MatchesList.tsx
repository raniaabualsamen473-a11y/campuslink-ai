
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
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-2">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="font-semibold text-foreground mb-1">No potential matches found</h3>
        <p className="text-sm text-muted-foreground">
          Submit a class swap request to find students who want to swap with you
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {totalMatches > 0 && (
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 p-3 rounded-md text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/50 mb-4">
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
