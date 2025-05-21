
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ProfileCompletionForm from "@/components/auth/ProfileCompletionForm";
import { ProfileCompletionValues } from "@/schemas/authSchema";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProfileCompletionHeader } from "@/components/auth/ProfileCompletionHeader";

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
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)] px-4 py-12">
      <Card className="w-full max-w-md shadow-glass">
        <CardHeader className="text-center">
          <ProfileCompletionHeader />
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
