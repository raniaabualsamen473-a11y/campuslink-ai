import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MessageCircle, Users, Zap, ExternalLink, Send, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const { user, isLoading, signInWithVerification } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [step, setStep] = useState<'username' | 'verification'>('username');
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [botUsername, setBotUsername] = useState('classSwap_notifier_bot');

  useEffect(() => {
    // Check if user is already logged in and redirect
    if (user) {
      console.log("User is logged in, redirecting to swap-requests");
      navigate("/swap-requests", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // Get the actual bot username
    const fetchBotInfo = async () => {
      try {
        const { data } = await supabase.functions.invoke('get-bot-info');
        if (data?.success && data?.botUsername) {
          setBotUsername(data.botUsername);
        }
      } catch (error) {
        console.error('Failed to fetch bot info:', error);
      }
    };
    
    fetchBotInfo();
  }, []);

  const handleSendCode = async () => {
    if (!username.trim()) {
      toast.error("Please enter your Telegram username");
      return;
    }

    if (!username.startsWith('@')) {
      toast.error("Username must start with @");
      return;
    }

    setIsSendingCode(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-verification', {
        body: { telegram_username: username.trim() }
      });

      if (error) {
        console.error('Send verification error:', error);
        toast.error(error.message || "Failed to send verification code");
        return;
      }

      if (!data.success) {
        const errorMessage = data.error || "Failed to send verification code";
        
        // Provide more helpful error messages
        if (errorMessage.includes('wait')) {
          const match = errorMessage.match(/(\d+)\s+seconds?/);
          const seconds = match ? match[1] : '90';
          toast.error(`Please wait ${seconds} seconds before requesting another code`);
        } else if (errorMessage.includes('register') || errorMessage.includes('/start')) {
          toast.error(`Please send /start to @${botUsername} first to register your account`);
        } else {
          toast.error(errorMessage);
        }
        
        // Update bot username from response if available
        if (data.botUsername) {
          setBotUsername(data.botUsername);
        }
        return;
      }
      
      // Update bot username from response if available
      if (data.botUsername) {
        setBotUsername(data.botUsername);
      }

      toast.success("Verification code sent! Check your Telegram messages.");
      setStep('verification');
    } catch (error) {
      console.error('Send code error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    if (!/^\d{6}$/.test(verificationCode.trim())) {
      toast.error("Verification code must be exactly 6 digits");
      return;
    }

    setIsAuthenticating(true);
    try {
      const result = await signInWithVerification(username.trim(), verificationCode.trim());
      if (result.success) {
        toast.success("Successfully verified and signed in!");
        navigate("/swap-requests", { replace: true });
      } else {
        const errorMessage = result.error || "Verification failed";
        if (errorMessage.includes('Invalid or expired')) {
          toast.error("The verification code is invalid or has expired. Please request a new code.");
          setStep('username'); // Go back to username step
          setVerificationCode('');
        } else if (errorMessage.includes('wait')) {
          toast.error(errorMessage);
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error("An unexpected error occurred during verification");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleBack = () => {
    setStep('username');
    setVerificationCode('');
  };

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
                <p className="font-medium text-foreground">Create Telegram Username</p>
                <p className="text-muted-foreground">You must create a Telegram username before starting the ChatBot</p>
              </div>
            </div>
          </div>

          {/* Custom Verification Flow */}
          <div className="text-center space-y-4">
            {step === 'username' ? (
              <div className="p-4 rounded-lg border border-dashed border-campus-purple/50 bg-campus-purple/5">
                <MessageCircle className="h-8 w-8 text-campus-purple mx-auto mb-4" />
                <div className="space-y-4">
                  <div className="text-xs text-muted-foreground mb-3 text-center">
                    <p>
                      Start a chat with 
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-campus-purple p-0 h-auto ml-1"
                        onClick={() => window.open(`https://t.me/${botUsername}`, '_blank')}
                      >
                        @{botUsername} <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                      <span className="font-bold text-foreground"> first</span>
                    </p>
                  </div>
                  <div className="text-left">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Telegram Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="@username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-1"
                      disabled={isSendingCode}
                    />
                  </div>
                  <Button 
                    onClick={handleSendCode}
                    disabled={isSendingCode || !username.trim()}
                    className="w-full"
                  >
                    {isSendingCode ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Sending Code...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="h-4 w-4" />
                        <span>Send Verification Code</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-campus-purple/50 bg-campus-purple/5">
                <Shield className="h-8 w-8 text-campus-purple mx-auto mb-4" />
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to your Telegram: <strong>{username}</strong>
                  </p>
                  <div className="text-left">
                    <Label htmlFor="code" className="text-sm font-medium">
                      Verification Code
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="mt-1 text-center text-lg tracking-widest"
                      disabled={isAuthenticating}
                      maxLength={6}
                      autoComplete="one-time-code"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      onClick={handleBack}
                      disabled={isAuthenticating}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleVerifyCode}
                      disabled={isAuthenticating || verificationCode.length !== 6}
                      className="flex-1"
                    >
                      {isAuthenticating ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        'Verify & Sign In'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
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