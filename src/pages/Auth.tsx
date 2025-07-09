import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MessageCircle, Users, Zap, ExternalLink } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { user, isLoading, signInWithTelegram } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Check if user is already logged in and redirect
    if (user) {
      console.log("User is logged in, redirecting to swap-requests");
      navigate("/swap-requests", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // Set up Telegram login callback
    (window as any).onTelegramAuth = async (user: any) => {
      console.log('Telegram auth callback received:', user);
      setIsAuthenticating(true);
      
      try {
        const result = await signInWithTelegram(user);
        if (result.success) {
          toast.success("Successfully signed in with Telegram!");
          navigate("/swap-requests", { replace: true });
        } else {
          toast.error(result.error || "Failed to authenticate with Telegram");
        }
      } catch (error) {
        console.error('Telegram auth error:', error);
        toast.error("An unexpected error occurred during authentication");
      } finally {
        setIsAuthenticating(false);
      }
    };

    return () => {
      // Cleanup
      if ((window as any).onTelegramAuth) {
        delete (window as any).onTelegramAuth;
      }
    };
  }, [signInWithTelegram, navigate]);

  if (isLoading || isAuthenticating) {
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
            Sign in with your Telegram account to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent className="glass-card backdrop-blur-md space-y-6">
          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg glass border border-white/10">
              <Users className="h-5 w-5 text-campus-purple" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Find Class Swaps</p>
                <p className="text-muted-foreground">Connect with students to swap class sections</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg glass border border-white/10">
              <MessageCircle className="h-5 w-5 text-campus-purple" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Instant Notifications</p>
                <p className="text-muted-foreground">Get notified via Telegram when matches are found</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg glass border border-white/10">
              <Zap className="h-5 w-5 text-campus-purple" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Quick & Secure</p>
                <p className="text-muted-foreground">Telegram-based authentication for security</p>
              </div>
            </div>
          </div>

          {/* Telegram Login Button */}
          <div className="text-center space-y-4">
            <div className="p-4 rounded-lg border border-dashed border-campus-purple/50 bg-campus-purple/5">
              <MessageCircle className="h-8 w-8 text-campus-purple mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to sign in with your Telegram account
              </p>
              
              {/* Telegram Login Widget */}
              <div className="flex justify-center">
                <iframe 
                  src="https://oauth.telegram.org/embed/classSwap_notifier_bot?origin=https%3A%2F%2Fpbqpbupsmzafbzlxccov.supabase.co&size=large&userpic=false&request_access=write"
                  width="203" 
                  height="40" 
                  frameBorder="0" 
                  scrolling="no" 
                  className="rounded"
                  style={{ border: 'none', overflow: 'hidden' }}
                ></iframe>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Don't have Telegram? 
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-campus-purple p-0 h-auto ml-1"
                  onClick={() => window.open('https://telegram.org/', '_blank')}
                >
                  Download it here <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </p>
              <p>Make sure you have a Telegram username set in your profile</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="text-center text-xs text-muted-foreground">
          <p>By signing in, you agree to our terms of service and privacy policy.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;