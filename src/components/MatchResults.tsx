
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MatchesList } from "./matches/MatchesList";
import { useMatches } from "./matches/useMatches";

interface MatchResultsProps {
  refreshTrigger?: number; // Prop to trigger refresh when new request is submitted
}

const MatchResults = ({ refreshTrigger = 0 }: MatchResultsProps) => {
  const { user } = useAuth();
  const { isLoading, groupedMatches } = useMatches(user?.id, refreshTrigger);

  return (
    <Card className="border-campus-purple/20">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center">
          <span>Potential Matches</span>
          {Object.keys(groupedMatches).length > 0 && (
            <span className="ml-2 text-sm bg-campus-purple text-white rounded-full px-2 py-0.5">
              {Object.values(groupedMatches).flat().length}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Students who might be interested in swapping with you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MatchesList 
          groupedMatches={groupedMatches} 
          isLoading={isLoading} 
        />
      </CardContent>
    </Card>
  );
};

export default MatchResults;
