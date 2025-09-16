import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropMatch } from "@/hooks/useDropMatches";
import { MessageSquare, Calendar, UserCheck } from "lucide-react";

interface DropMatchCardProps {
  match: DropMatch;
}

export const DropMatchCard = ({ match }: DropMatchCardProps) => {
  const getMatchIcon = () => {
    return match.type === "drop" ? "⬇️" : "⬆️";
  };

  const getMatchTypeLabel = () => {
    return match.type === "drop" ? "Available Course" : "Course Request";
  };

  const getMatchTypeColor = () => {
    return match.type === "drop" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800";
  };

  return (
    <Card className="glass-card hover:shadow-neon-purple transition-all duration-300 border-l-4 border-l-campus-purple">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{getMatchIcon()}</span>
            <Badge className={getMatchTypeColor()}>
              {getMatchTypeLabel()}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-foreground">Section:</span>
            <span className="text-sm text-muted-foreground">{match.section}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {match.isAnonymous ? "Anonymous Student" : match.user}
            </span>
          </div>
          
          {match.telegram_username && (
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">@{match.telegram_username}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{match.dateCreated}</span>
          </div>

          <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
            {match.action_type}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};