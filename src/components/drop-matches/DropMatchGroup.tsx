import { DropMatch } from "@/hooks/useDropMatches";
import { DropMatchCard } from "./DropMatchCard";

interface DropMatchGroupProps {
  course: string;
  matches: DropMatch[];
}

export const DropMatchGroup = ({ course, matches }: DropMatchGroupProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <span className="mr-2">📚</span>
          {course}
        </h3>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {matches.length} match{matches.length !== 1 ? 'es' : ''}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <DropMatchCard
            key={match.id}
            match={match}
          />
        ))}
      </div>
    </div>
  );
};