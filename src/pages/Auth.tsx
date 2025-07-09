
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

// Form validation schema
const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().min(2, { message: "Full name is required" }).optional().or(z.literal('')),
  universityId: z.string().optional().or(z.literal('')),
  telegramUsername: z.string()
    .refine(val => !val || !/^@/.test(val), {
      message: "Please enter the username without the @ symbol"
    })
    .refine(val => !val || /^[a-zA-Z0-9_]+$/.test(val), {
      message: "Username can only contain letters, numbers, and underscores"
    })
    .optional()
    .or(z.literal('')),
});

type AuthFormValues = z.infer<typeof authSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const { user, isLoading, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      universityId: "",
      telegramUsername: "",
    },
  });

  useEffect(() => {
    // Check if user is already logged in and redirect
    if (user) {
      console.log("User is logged in, redirecting to swap-requests");
      navigate("/swap-requests", { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (values: AuthFormValues) => {
    setIsSubmitting(true);
    try {
      if (authMode === "signin") {
        const result = await signInWithEmail(values.email, values.password);
        if (result.data) {
          // Success! The toast is already shown in the auth hook
          navigate("/swap-requests", { replace: true });
        }
      } else {
        // For signup, include additional user data
        const userData = {
          full_name: values.fullName,
          university_id: values.universityId,
          telegram_username: values.telegramUsername,
        };
        
        const result = await signUpWithEmail(values.email, values.password, userData);
        if (result.data) {
          navigate("/swap-requests", { replace: true });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <div className="animate-glow-pulse rounded-full h-12 w-12 border-2 border-campus-purple"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)] px-4 py-12">
      <Card className="w-full max-w-md shadow-glass">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="https://pbqpbupsmzafbzlxccov.supabase.co/storage/v1/object/public/logo//CampusLink.ai(Logo)%20(Logo).png" 
              alt="CampusLink AI Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Welcome to CampusLink AI</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in or create an account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="glass-card backdrop-blur-md">
          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>
            
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

                {authMode === "signup" && (
                  <>
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
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
                      name="universityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">University ID</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your student ID number" 
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
                  </>
                )}
                
                <Button 
                  type="submit" 
                  variant="neon"
                  className="w-full btn-glow"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {authMode === "signin" ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : (
                    <>{authMode === "signin" ? "Sign In" : "Create Account"}</>
                  )}
                </Button>
              </form>
            </Form>

          </Tabs>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          <p>By signing up, you agree to our terms of service and privacy policy.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
