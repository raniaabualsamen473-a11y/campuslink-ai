
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProfileCompletionValues } from "@/schemas/authSchema";
import { useLanguage } from "@/components/LanguageProvider";

interface ProfileUniversityIdFieldProps {
  form: UseFormReturn<ProfileCompletionValues>;
}

export const ProfileUniversityIdField = ({ form }: ProfileUniversityIdFieldProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  // Watch university ID and full name to generate email
  const universityId = form.watch("universityId");
  const fullName = form.watch("fullName");
  
  // Generate email using first 3 characters of the name and university ID
  const universityEmail = (universityId && universityId.length === 7 && fullName) 
    ? `${fullName.slice(0, 3).toLowerCase()}${universityId}@ju.edu.jo` 
    : "";

  return (
    <>
      <FormField
        control={form.control}
        name="universityId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">
              {isArabic ? "رقم الطالب الجامعي" : "University ID"}
            </FormLabel>
            <FormControl>
              <Input 
                placeholder={isArabic ? "رقم مكون من 7 أرقام" : "7-digit ID number"} 
                {...field} 
                className="glass-input"
                required
                maxLength={7}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {universityId && universityId.length === 7 && fullName && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {isArabic ? "البريد الإلكتروني الجامعي" : "University Email"}
          </label>
          <Input 
            value={universityEmail}
            className="glass-input"
            disabled
          />
          <p className="text-xs text-muted-foreground">
            {isArabic 
              ? "تم إنشاؤه تلقائيًا من اسمك ورقم الطالب الجامعي" 
              : "Auto-generated from your name and university ID"}
          </p>
        </div>
      )}
    </>
  );
};
