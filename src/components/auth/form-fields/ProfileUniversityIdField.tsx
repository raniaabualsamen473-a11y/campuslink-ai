
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
  
  // Generate initial email using first 3 characters of the name and university ID
  const generateInitialEmail = () => {
    if (universityId && universityId.length === 7 && fullName && fullName.length >= 3) {
      return `${fullName.slice(0, 3).toLowerCase()}${universityId}`;
    }
    return "";
  };
  
  const [localPart, domainPart] = ["", "ju.edu.jo"];
  
  const handleLocalPartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocalPart = e.target.value;
    // Store the full email in a hidden field or state if needed
    console.log(`Email updated to: ${newLocalPart}@${domainPart}`);
  };

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
          <div className="flex glass-input rounded-xl border border-white/20 bg-white/10 backdrop-blur-md focus-within:border-campus-purple/50 focus-within:ring-campus-purple/30 dark:bg-slate-900/30 dark:border-white/10 dark:focus-within:border-campus-purple/70 dark:focus-within:ring-campus-purple/40">
            <input
              className="flex-1 h-10 bg-transparent px-3 py-2 text-base text-foreground focus:outline-none md:text-sm dark:text-white"
              defaultValue={generateInitialEmail()}
              onChange={handleLocalPartChange}
            />
            <div className="flex items-center px-3 text-muted-foreground">
              @ju.edu.jo
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {isArabic 
              ? "تم إنشاؤه تلقائيًا من اسمك ورقم الطالب الجامعي، ويمكنك تعديله" 
              : "Auto-generated from your name and university ID, but you can edit it"}
          </p>
        </div>
      )}
    </>
  );
};
