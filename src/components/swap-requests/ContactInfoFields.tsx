
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslate } from "@/components/LanguageProvider";

interface ContactInfoFieldsProps {
  telegramUsername: string;
  isAnonymous: boolean;
  setTelegramUsername: (value: string) => void;
  setIsAnonymous: (value: boolean) => void;
}

export const ContactInfoFields = ({
  telegramUsername,
  isAnonymous,
  setTelegramUsername,
  setIsAnonymous
}: ContactInfoFieldsProps) => {
  const { t } = useTranslate();
  
  return (
    <div className="space-y-4 pt-4">
      <h3 className="font-medium text-lg text-campus-darkPurple dark:text-campus-purple">
        {t('contact.title', 'Contact Information')}
      </h3>
        
      {/* Telegram Username */}
      <div className="space-y-2">
        <Label htmlFor="telegram" className="text-foreground">{t('contact.telegramUsername', 'Your Telegram Username')}</Label>
        <Input 
          id="telegram" 
          placeholder="@username" 
          value={telegramUsername}
          onChange={(e) => setTelegramUsername(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {t('contact.usageInfo', 'Used to connect you with matching students')}
        </p>
      </div>

      {/* Anonymity Option */}
      <div className="flex items-center space-x-4 pt-2">
        <Switch
          id="anonymous"
          checked={isAnonymous}
          onCheckedChange={setIsAnonymous}
        />
        <div>
          <Label htmlFor="anonymous" className="font-medium text-foreground">
            {t('contact.anonymous', 'Submit Anonymously')}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t('contact.anonymousInfo', 'Your name won\'t be visible to other students')}
          </p>
        </div>
      </div>
    </div>
  );
};
