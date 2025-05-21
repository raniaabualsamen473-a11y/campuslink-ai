
import React from "react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";

export const ProfileCompletionHeader = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <>
      <div className="flex justify-center mb-4">
        <img 
          src="https://pbqpbupsmzafbzlxccov.supabase.co/storage/v1/object/public/logo//CampusLink.ai(Logo)%20(Logo).png" 
          alt="CampusLink AI Logo" 
          className="h-16 w-16 object-contain"
        />
      </div>
      <CardTitle className="text-2xl font-bold text-foreground">
        {isArabic ? "أكمل ملفك الشخصي" : "Complete Your Profile"}
      </CardTitle>
      <CardDescription className="text-muted-foreground">
        {isArabic 
          ? "يرجى تقديم المعلومات التالية لإكمال ملفك الشخصي" 
          : "Please provide the following information to complete your profile"}
      </CardDescription>
    </>
  );
};
