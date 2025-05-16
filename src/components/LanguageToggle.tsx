
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLanguage, useTranslate } from "./LanguageProvider";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslate();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleLanguage}
      className="text-foreground hover:text-campus-purple"
      title={t('common.otherLanguage')}
    >
      <Globe className="h-5 w-5" />
      <span className="sr-only">{t('common.otherLanguage')}</span>
    </Button>
  );
}
