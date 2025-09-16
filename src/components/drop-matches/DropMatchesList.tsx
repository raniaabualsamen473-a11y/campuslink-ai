import { DropMatch } from "@/hooks/useDropMatches";
import { DropMatchGroup } from "./DropMatchGroup";
import { Skeleton } from "@/components/ui/skeleton";

interface DropMatchesListProps {
  groupedMatches: Record<string, DropMatch[]>;
  isLoading: boolean;
}

export const DropMatchesList = ({ groupedMatches, isLoading }: DropMatchesListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (Object.keys(groupedMatches).length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-2">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="font-semibold text-foreground mb-1">No matches found yet</h3>
        <p className="text-sm text-muted-foreground">
          Submit drop or request entries to find potential matches
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedMatches).map(([course, matches]) => (
        <DropMatchGroup 
          key={course}
          course={course}
          matches={matches}
        />
      ))}
    </div>
  );
};