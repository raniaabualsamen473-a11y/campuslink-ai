
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileCompletionForm from "@/components/auth/ProfileCompletionForm";
import { ProfileCompletionValues } from "@/schemas/authSchema";

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { user, isLoading, isProfileComplete, completeUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If user is not logged in, redirect to auth page
    if (!isLoading && !user) {
      navigate("/auth", { replace: true });
    }
    
    // If profile is already complete, redirect to swap requests
    if (!isLoading && isProfileComplete) {
      navigate("/swap-requests", { replace: true });
    }
  }, [user, isLoading, isProfileComplete, navigate]);

  const handleSubmit = async (values: ProfileCompletionValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const result = await completeUserProfile(values);
      if (result.success) {
        navigate("/swap-requests", { replace: true });
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
          <CardTitle className="text-2xl font-bold text-foreground">Complete Your Profile</CardTitle>
          <CardDescription className="text-muted-foreground">
            Please provide the following information to complete your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="glass-card backdrop-blur-md">
          <ProfileCompletionForm 
            user={user}
            isSubmitting={isSubmitting} 
            onSubmit={handleSubmit} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletion;
