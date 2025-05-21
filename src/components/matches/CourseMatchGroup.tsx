
import { Match } from "@/types/swap";
import { MatchCard } from "./MatchCard";

interface CourseMatchGroupProps {
  courseName: string;
  matches: Match[];
}

export const CourseMatchGroup = ({ courseName, matches }: CourseMatchGroupProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-campus-darkPurple border-b border-campus-purple/20 pb-2">
        {courseName}
        <span className="text-sm font-normal text-gray-500 ml-2">
          ({matches.length} {matches.length === 1 ? 'match' : 'matches'})
        </span>
      </h3>
      
      <div className="space-y-4">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
};
