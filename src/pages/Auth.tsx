
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircleIcon } from "lucide-react";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { AuthFormValues } from "@/schemas/authSchema";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isProfileComplete, signInWithEmail, signUpWithEmail } = useAuth();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check for verification success parameter
  const isVerified = new URLSearchParams(location.search).get('verified') === 'true';

  useEffect(() => {
    // If verification was successful, show a toast message
    if (isVerified) {
      toast.success("Email verified successfully! Please sign in.");
      // Automatically switch to sign in tab if verified
      setAuthMode("signin");
    }

    console.log("Auth page - User state:", user ? "Logged in" : "Not logged in");
    console.log("Profile complete:", isProfileComplete);

    // Check if user is already logged in
    if (user) {
      console.log("User is logged in, checking profile completion status");
      
      // If profile is not complete, redirect to profile completion
      if (!isProfileComplete) {
        console.log("Profile is incomplete, redirecting to profile completion");
        navigate("/profile-completion", { replace: true });
      } else {
        // Otherwise go to swap requests
        console.log("Profile is complete, redirecting to swap-requests");
        navigate("/swap-requests", { replace: true });
      }
    }
  }, [user, isProfileComplete, navigate, isVerified]);

  const handleSubmit = async (values: AuthFormValues) => {
    setIsSubmitting(true);
    try {
      console.log(`Handling ${authMode} submission`);
      
      if (authMode === "signin") {
        console.log("Signing in with:", values.email);
        const result = await signInWithEmail(values.email, values.password);
        console.log("Sign in result:", result.data ? "Success" : "Failed", result.error);
        
        if (result.data) {
          // Success! Check if profile needs completion in the useEffect above
          console.log("Sign in successful, user should be redirected by useEffect");
        }
      } else {
        // For signup, create full name from parts if not already set
        if (!values.fullName && (values.firstName || values.lastName)) {
          const nameParts = [
            values.firstName || "",
            values.secondName || "",
            values.thirdName || "",
            values.lastName || ""
          ].filter(Boolean);
          
          values.fullName = nameParts.join(" ");
        }
        
        // For signup, include additional user data
        const userData = {
          full_name: values.fullName,
          university_id: values.universityId,
          university_email: values.universityEmail,
          telegram_username: values.telegramUsername,
          first_name: values.firstName,
          second_name: values.secondName,
          third_name: values.thirdName, 
          last_name: values.lastName
        };
        
        console.log("Signing up with:", values.email, userData);
        const result = await signUpWithEmail(values.email, values.password, userData);
        console.log("Sign up result:", result.data ? "Success" : "Verification needed/Failed", result.error);
        
        if (result.data) {
          // Profile should be complete since we collected all data at signup
          console.log("Sign up with immediate session successful, redirecting to swap-requests");
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
          
          {isVerified && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Email verified!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your email has been successfully verified. You can now sign in.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent className="glass-card backdrop-blur-md">
          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <SignInForm isSubmitting={isSubmitting} onSubmit={handleSubmit} />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignUpForm isSubmitting={isSubmitting} onSubmit={handleSubmit} />
            </TabsContent>
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
