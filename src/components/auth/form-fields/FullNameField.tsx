
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { AuthFormValues } from "@/schemas/authSchema";

interface FullNameFieldProps {
  form: UseFormReturn<AuthFormValues>;
}

export const FullNameField = ({ form }: FullNameFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="fullName"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-foreground">Full Name</FormLabel>
          <FormControl>
            <Input 
              placeholder="Full name as it's shown on your university ID" 
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
