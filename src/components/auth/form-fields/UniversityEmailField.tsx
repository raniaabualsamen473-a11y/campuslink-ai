
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { AuthFormValues } from "@/schemas/authSchema";
import { useLanguage } from "@/components/LanguageProvider";

interface UniversityEmailFieldProps {
  form: UseFormReturn<AuthFormValues>;
}

export const UniversityEmailField = ({ form }: UniversityEmailFieldProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const handleLocalPartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const localPart = e.target.value;
    form.setValue("universityEmail", `${localPart}@ju.edu.jo`, { 
      shouldValidate: true,
      shouldDirty: true 
    });
  };
  
  // Extract the local part (before @) from the full email
  const email = form.watch("universityEmail");
  const localPart = email ? email.split("@")[0] : "";
  
  return (
    <FormField
      control={form.control}
      name="universityEmail"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-foreground">
            {isArabic ? "البريد الإلكتروني الجامعي" : "University Email"}
          </FormLabel>
          <FormControl>
            <div className="flex glass-input rounded-xl border border-white/20 bg-white/10 backdrop-blur-md focus-within:border-campus-purple/50 focus-within:ring-campus-purple/30 dark:bg-slate-900/30 dark:border-white/10 dark:focus-within:border-campus-purple/70 dark:focus-within:ring-campus-purple/40">
              <input
                className="flex-1 h-10 bg-transparent px-3 py-2 text-base text-foreground focus:outline-none md:text-sm dark:text-white"
                value={localPart}
                onChange={handleLocalPartChange}
                required
              />
              <div className="flex items-center px-3 text-muted-foreground">
                @ju.edu.jo
              </div>
            </div>
          </FormControl>
          <FormMessage />
          <p className="text-xs text-muted-foreground mt-1">
            {isArabic 
              ? "تم إنشاؤه تلقائيًا من اسمك ورقم الطالب الجامعي، ويمكنك تعديله" 
              : "Auto-generated from your name and university ID, but you can edit it"}
          </p>
        </FormItem>
      )}
    />
  );
};
