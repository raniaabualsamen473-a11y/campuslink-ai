import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DropMatch } from "@/hooks/useDropMatches";
import { MessageSquare, Calendar, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface DropMatchCardProps {
  match: DropMatch;
}

export const DropMatchCard = ({ match }: DropMatchCardProps) => {
  const handleContact = (match: DropMatch) => {
    if (match.telegram_username) {
      openTelegramChat(match.telegram_username);
    } else {
      toast.info("Contact information not available", {
        description: "The student hasn't provided contact information."
      });
    }
  };

  const openTelegramChat = (username: string | null) => {
    if (!username) {
      toast.info("Telegram username not available", {
        description: "The student hasn't provided their Telegram username."
      });
      return;
    }
    
    // Format the username for Telegram URL
    const cleanUsername = username.startsWith('@') 
      ? username.substring(1) 
      : username;
      
    window.open(`https://t.me/${cleanUsername}`, '_blank');
    
    toast.success("Opening Telegram chat", {
      description: `Connecting with ${match.isAnonymous ? "user" : match.user}`
    });
  };

  const getMatchIcon = () => {
    return match.type === "drop" ? "⬇️" : "⬆️";
  };

  const getMatchTypeLabel = () => {
    return match.type === "drop" ? "Available Course" : "Course Request";
  };

  return (
    <div className="border rounded-lg p-4 bg-card shadow-sm hover:shadow-neon-green transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <div className="mt-1 space-y-1">
            <p className="text-sm text-adaptive-muted">
              <span className="font-medium text-adaptive-soft">Section: </span>
              {match.section}
            </p>
            <p className="text-sm text-adaptive-muted">
              <span className="font-medium text-adaptive-soft">Type: </span>
              {getMatchTypeLabel()}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={
          "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50 shadow-neon-green"
        }>
          Match
        </Badge>
      </div>
      
      <div className="mt-2">
        <p className="text-sm font-medium text-adaptive">
          Posted by: {match.isAnonymous ? "Anonymous Student" : match.user}
        </p>
        <p className="text-xs text-adaptive-soft">{match.dateCreated}</p>
        <div className="mt-1 text-xs text-adaptive-muted bg-muted/50 rounded px-2 py-1 inline-block">
          {match.action_type} {getMatchIcon()}
        </div>
      </div>
      
      <Separator className="my-3" />
      
      <div className="mt-2 flex justify-end">
        {match.telegram_username ? (
          <Button 
            size="sm" 
            variant="telegram"
            onClick={() => openTelegramChat(match.telegram_username)}
            title={`Chat with ${match.isAnonymous ? "user" : match.user} on Telegram`}
          >
            <MessageSquare size={16} className="mr-1" />
            Chat on Telegram
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="outline" 
            disabled
            title="Contact information not available"
          >
            <MessageSquare size={16} className="mr-1" />
            No Contact Info
          </Button>
        )}
      </div>
    </div>
  );
};