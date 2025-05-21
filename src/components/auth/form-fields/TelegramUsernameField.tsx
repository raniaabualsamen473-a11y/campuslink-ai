
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { AuthFormValues } from "@/schemas/authSchema";

interface TelegramUsernameFieldProps {
  form: UseFormReturn<AuthFormValues>;
}

export const TelegramUsernameField = ({ form }: TelegramUsernameFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="telegramUsername"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-foreground">Telegram Username</FormLabel>
          <FormControl>
            <div className="flex items-center">
              <span className="glass border border-white/20 border-r-0 rounded-l-xl px-3 py-2 text-sm text-muted-foreground">
                @
              </span>
              <Input 
                placeholder="username" 
                {...field} 
                className="glass-input rounded-l-none"
                required
              />
            </div>
          </FormControl>
          <p className="text-xs text-muted-foreground mt-1">Enter your Telegram username (no @ symbol). Required for contact when a match is found.</p>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
