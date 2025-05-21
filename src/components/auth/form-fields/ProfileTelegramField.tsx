
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProfileCompletionValues } from "@/schemas/authSchema";
import { useLanguage } from "@/components/LanguageProvider";

interface ProfileTelegramFieldProps {
  form: UseFormReturn<ProfileCompletionValues>;
}

export const ProfileTelegramField = ({ form }: ProfileTelegramFieldProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <FormField
      control={form.control}
      name="telegramUsername"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-foreground">
            {isArabic ? "اسم المستخدم في تيليجرام" : "Telegram Username"}
          </FormLabel>
          <div className="flex items-center">
            <span className="bg-muted border border-r-0 border-input rounded-l-md px-3 py-2 text-sm text-foreground">
              @
            </span>
            <FormControl>
              <Input 
                placeholder={isArabic ? "اسم المستخدم" : "username"} 
                {...field} 
                className="glass-input rounded-l-none"
              />
            </FormControl>
          </div>
          <FormMessage />
          <p className="text-xs text-muted-foreground">
            {isArabic 
              ? "مطلوب للتواصل معك عند العثور على مطابقة" 
              : "Required for contacting you when a match is found"}
          </p>
        </FormItem>
      )}
    />
  );
};
