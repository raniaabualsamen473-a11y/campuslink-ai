
import { useEffect, useState, useMemo } from "react";
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
  firstName: z.string().min(2, { message: "First name is required" }),
  secondName: z.string().min(2, { message: "Second name is required" }),
  thirdName: z.string().min(2, { message: "Third name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  universityId: z.string()
    .regex(/^\d{7}$/, { message: "University ID must be exactly 7 digits" }),
  universityEmail: z.string()
    .regex(/^[a-z]{3}\d{7}@ju\.edu\.jo$/, { 
      message: "University email must follow the format: abc1234567@ju.edu.jo" 
    }),
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
        const fullName = `${values.firstName} ${values.secondName} ${values.thirdName} ${values.lastName}`;
        const userData = {
          full_name: fullName,
          first_name: values.firstName,
          second_name: values.secondName,
          third_name: values.thirdName,
          last_name: values.lastName,
          university_id: values.universityId,
          university_email: values.universityEmail,
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              variant="glass"
              type="button"
              className="w-full"
              onClick={() => signInWithGoogle()}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
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
