
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Successfully signed in!");
      navigate("/swap-requests");
    } catch (error: any) {
      toast.error(error.message || "Error signing in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create new user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            university_id: universityId,
            telegram_username: telegramUsername,
          },
        },
      });
      
      if (error) throw error;
      
      toast.success("Account created successfully! Check your email for verification.");
      
      // Automatically sign in if email verification is not required
      if (data.user && !data.user.email_confirmed_at) {
        toast.info("Please check your email to confirm your account before logging in.", {
          duration: 5000,
        });
      } else {
        navigate("/swap-requests");
      }
    } catch (error: any) {
      toast.error(error.message || "Error creating account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-black">Sign In</CardTitle>
              <CardDescription className="text-gray-700">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black">University Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your.email@university.edu" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-black">Password</Label>
                    <a 
                      href="#" 
                      className="text-xs text-campus-purple hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info("Password reset functionality will be implemented soon.");
                      }}
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-campus-purple hover:bg-campus-darkPurple text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-black">Create Account</CardTitle>
              <CardDescription className="text-gray-700">
                Create a new account to start using Class Swap
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname" className="text-black">Full Name</Label>
                  <Input 
                    id="fullname" 
                    placeholder="John Doe" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university-id" className="text-black">University ID</Label>
                  <Input 
                    id="university-id" 
                    placeholder="Your student ID number" 
                    required 
                    value={universityId}
                    onChange={(e) => setUniversityId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-black">University Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="your.email@university.edu" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram" className="text-black">Telegram Username</Label>
                  <Input 
                    id="telegram" 
                    placeholder="@username" 
                    required
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Required for contact when a match is found</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-black">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit"
                  className="w-full bg-campus-purple hover:bg-campus-darkPurple text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthForm;
