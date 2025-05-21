
import { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { AuthFormValues } from "@/schemas/authSchema";

interface UniversityIdFieldProps {
  form: UseFormReturn<AuthFormValues>;
}

export const UniversityIdField = ({ form }: UniversityIdFieldProps) => {
  const watchUniversityId = form.watch("universityId");
  const watchFullName = form.watch("fullName");
  
  // Auto-generate university email when university ID or full name changes
  useEffect(() => {
    if (watchUniversityId && watchUniversityId.length === 7 && watchFullName) {
      const firstThreeLetters = watchFullName.slice(0, 3).toLowerCase();
      const universityEmail = `${firstThreeLetters}${watchUniversityId}@ju.edu.jo`;
      form.setValue("universityEmail", universityEmail);
    }
  }, [watchUniversityId, watchFullName, form]);

  return (
    <FormField
      control={form.control}
      name="universityId"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-foreground">University ID (7 digits)</FormLabel>
          <FormControl>
            <Input 
              placeholder="1234567" 
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
  );
};
