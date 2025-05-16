
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Match } from "@/types/swap";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface MatchCardProps {
  match: Match;
}

export const MatchCard = ({ match }: MatchCardProps) => {
  const handleContact = (match: Match) => {
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

  return (
    <div className="border rounded-lg p-4 bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="mt-1 space-y-1">
            {match.type === "swap" && match.currentSection && (
              <p className="text-sm text-adaptive-muted">
                <span className="font-medium text-adaptive-soft">From: </span>
                {match.currentSection}
              </p>
            )}
            <p className="text-sm text-adaptive-muted">
              <span className="font-medium text-adaptive-soft">To: </span>
              {match.desiredSection}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={`${
          match.matchPercent === 100 
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50" 
            : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50"
        }`}>
          {match.matchPercent}% Match
        </Badge>
      </div>
      
      <div className="mt-2">
        <p className="text-sm font-medium text-adaptive">
          Posted by: {match.isAnonymous ? "Anonymous Student" : match.user}
        </p>
        <p className="text-xs text-adaptive-soft">{match.dateCreated}</p>
      </div>
      
      <Separator className="my-3" />
      
      <div className="mt-2 flex justify-end gap-2">
        {match.telegram_username && (
          <Button 
            size="sm" 
            variant="telegram"
            onClick={() => openTelegramChat(match.telegram_username)}
            title={`Chat with ${match.isAnonymous ? "user" : match.user} on Telegram`}
          >
            <MessageSquare size={16} className="mr-1" />
            Chat on Telegram
          </Button>
        )}
        <Button 
          size="sm" 
          variant="match-success"
          onClick={() => handleContact(match)}
        >
          Contact
        </Button>
      </div>
    </div>
  );
};
