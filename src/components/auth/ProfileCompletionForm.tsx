
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { profileCompletionSchema, ProfileCompletionValues } from "@/schemas/authSchema";
import { User } from "@supabase/supabase-js";

interface ProfileCompletionFormProps {
  user: User | null;
  isSubmitting: boolean;
  onSubmit: (values: ProfileCompletionValues) => Promise<void>;
}

const ProfileCompletionForm = ({ user, isSubmitting, onSubmit }: ProfileCompletionFormProps) => {
  const userData = user?.user_metadata || {};
  
  const form = useForm<ProfileCompletionValues>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      firstName: userData.first_name || "",
      secondName: userData.second_name || "",
      thirdName: userData.third_name || "",
      lastName: userData.last_name || "",
      universityId: userData.university_id || "",
      telegramUsername: userData.telegram_username || "",
    },
    mode: "onChange"
  });

  // Auto-generate university email when university ID changes
  const universityId = form.watch("universityId");
  const universityEmail = universityId && universityId.length === 7 
    ? `${universityId.slice(0, 3)}${universityId}@ju.edu.jo` 
    : "";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">First Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="First Name" 
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
                    placeholder="Second Name" 
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="thirdName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Third Name (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Third Name" 
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
                    placeholder="Last Name" 
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
          name="universityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">University ID</FormLabel>
              <FormControl>
                <Input 
                  placeholder="7-digit ID number" 
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

        {universityId && universityId.length === 7 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">University Email</label>
            <Input 
              value={universityEmail}
              className="glass-input"
              disabled
            />
            <p className="text-xs text-muted-foreground">Auto-generated from your university ID</p>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="telegramUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Telegram Username</FormLabel>
              <div className="flex items-center">
                <span className="bg-muted border border-r-0 border-input rounded-l-md px-3 py-2 text-sm text-foreground">
                  @
                </span>
                <FormControl>
                  <Input 
                    placeholder="username" 
                    {...field} 
                    className="glass-input rounded-l-none"
                  />
                </FormControl>
              </div>
              <FormMessage />
              <p className="text-xs text-muted-foreground">Required for contacting you when a match is found</p>
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          variant="neon"
          className="w-full btn-glow"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving Profile...
            </span>
          ) : (
            <>Complete Profile</>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileCompletionForm;
