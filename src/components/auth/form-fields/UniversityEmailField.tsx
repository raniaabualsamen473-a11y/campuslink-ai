
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { AuthFormValues } from "@/schemas/authSchema";

interface UniversityEmailFieldProps {
  form: UseFormReturn<AuthFormValues>;
}

export const UniversityEmailField = ({ form }: UniversityEmailFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="universityEmail"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-foreground">University Email</FormLabel>
          <FormControl>
            <Input 
              placeholder="abc1234567@ju.edu.jo" 
              {...field} 
              className="glass-input"
              required
              readOnly
            />
          </FormControl>
          <FormMessage />
          <p className="text-xs text-muted-foreground mt-1">
            Auto-generated from your university ID
          </p>
        </FormItem>
      )}
    />
  );
};
