
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authSchema, AuthFormValues } from "@/schemas/authSchema";

interface SignUpFormProps {
  isSubmitting: boolean;
  onSubmit: (values: AuthFormValues) => Promise<void>;
}

const SignUpForm = ({ isSubmitting, onSubmit }: SignUpFormProps) => {
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      secondName: "",
      thirdName: "",
      lastName: "",
      universityId: "",
      universityEmail: "",
      telegramUsername: "",
    },
    mode: "onChange"
  });
  
  const watchFirstName = form.watch("firstName");
  const watchUniversityId = form.watch("universityId");

  // Auto-generate university email when first name and university ID change
  useEffect(() => {
    if (watchFirstName && watchUniversityId && watchFirstName.length >= 3 && watchUniversityId.length === 7) {
      const firstThreeLetters = watchFirstName.slice(0, 3).toLowerCase();
      const universityEmail = `${firstThreeLetters}${watchUniversityId}@ju.edu.jo`;
      form.setValue("universityEmail", universityEmail);
    }
  }, [watchFirstName, watchUniversityId, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="your.email@example.com" 
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  {...field} 
                  className="glass-input"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">First Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="First" 
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
                    placeholder="Second" 
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
            name="thirdName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Third Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Third" 
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
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Last Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Last" 
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
                Auto-generated from your first name and university ID
              </p>
            </FormItem>
          )}
        />

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
        
        <Button 
          type="submit" 
          variant="neon"
          className="w-full btn-glow"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating account...
            </span>
          ) : (
            <>Create Account</>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SignUpForm;
