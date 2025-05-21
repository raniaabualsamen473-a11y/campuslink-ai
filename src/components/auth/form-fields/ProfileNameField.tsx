
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProfileCompletionValues } from "@/schemas/authSchema";
import { useLanguage } from "@/components/LanguageProvider";

interface ProfileNameFieldProps {
  form: UseFormReturn<ProfileCompletionValues>;
}

export const ProfileNameField = ({ form }: ProfileNameFieldProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <FormField
      control={form.control}
      name="fullName"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-foreground">
            {isArabic ? "الاسم الكامل" : "Full Name"}
          </FormLabel>
          <FormControl>
            <Input 
              placeholder={isArabic 
                ? "الاسم الكامل كما هو مكتوب على بطاقة الجامعة" 
                : "Full name as it's shown on your university ID"
              } 
              {...field} 
              className="glass-input"
              required
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
