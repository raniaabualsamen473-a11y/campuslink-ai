
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn, useWatch } from "react-hook-form";
import { AuthFormValues } from "@/schemas/authSchema";
import { useEffect } from "react";

interface FullNameFieldProps {
  form: UseFormReturn<AuthFormValues>;
}

export const FullNameField = ({ form }: FullNameFieldProps) => {
  // Watch first, second, third, and last name fields to update full name
  const firstName = form.watch("firstName") || "";
  const secondName = form.watch("secondName") || "";
  const thirdName = form.watch("thirdName") || "";
  const lastName = form.watch("lastName") || "";

  // Auto-generate full name when individual name parts change
  useEffect(() => {
    const parts = [firstName, secondName, thirdName, lastName].filter(Boolean);
    if (parts.length > 0) {
      form.setValue("fullName", parts.join(" "), { shouldValidate: true });
    }
  }, [firstName, secondName, thirdName, lastName, form]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Full Name Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">First Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="First name" 
                  {...field} 
                  className="glass-input"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="secondName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Second Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Second name" 
                  {...field} 
                  className="glass-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="thirdName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Third Name (optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Third name" 
                  {...field} 
                  className="glass-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Last Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Last name" 
                  {...field} 
                  className="glass-input"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Full Name (auto-generated)</FormLabel>
            <FormControl>
              <Input 
                placeholder="Full name as it's shown on your university ID" 
                {...field} 
                className="glass-input"
                readOnly
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
