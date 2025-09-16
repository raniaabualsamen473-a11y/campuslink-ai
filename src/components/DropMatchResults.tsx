import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropMatchesList } from "./drop-matches/DropMatchesList";
import { useDropMatches } from "@/hooks/useDropMatches";

interface DropMatchResultsProps {
  refreshTrigger?: number; // Prop to trigger refresh when new request is submitted
}

const DropMatchResults = ({ refreshTrigger = 0 }: DropMatchResultsProps) => {
  const { user } = useAuth();
  const { isLoading, groupedMatches } = useDropMatches(user?.id, refreshTrigger);

  return (
    <Card className="border-campus-purple/20">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center">
          <span>Drop Request Matches</span>
          {Object.keys(groupedMatches).length > 0 && (
            <span className="ml-2 text-sm bg-campus-purple text-white rounded-full px-2 py-0.5">
              {Object.values(groupedMatches).flat().length}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Students who want courses you're dropping or courses available for you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DropMatchesList 
          groupedMatches={groupedMatches} 
          isLoading={isLoading} 
        />
      </CardContent>
    </Card>
  );
};

export default DropMatchResults;