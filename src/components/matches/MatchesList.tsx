
import { Match } from "@/types/swap";
import { CourseMatchGroup } from "./CourseMatchGroup";

interface MatchesListProps {
  groupedMatches: Record<string, Match[]>;
  isLoading: boolean;
}

export const MatchesList = ({ groupedMatches, isLoading }: MatchesListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">Loading potential matches...</p>
      </div>
    );
  }

  if (Object.keys(groupedMatches).length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No potential matches found</p>
        <p className="text-sm text-gray-400 mt-1">
          Submit a request to find students who want to swap with you
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
