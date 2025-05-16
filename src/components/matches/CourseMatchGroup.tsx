
import { Match } from "@/types/swap";
import { MatchCard } from "./MatchCard";

interface CourseMatchGroupProps {
  courseName: string;
  matches: Match[];
}

export const CourseMatchGroup = ({ courseName, matches }: CourseMatchGroupProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-black border-b pb-2">{courseName}</h3>
      
      <div className="space-y-4">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
};
