
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import SwapRequests from "./pages/SwapRequests";
import Petitions from "./pages/Petitions";
import Auth from "./pages/Auth";
import ProfileCompletion from "./pages/ProfileCompletion";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useEffect } from "react";
import { toast } from "sonner";
import { ThemeProvider } from "./components/ThemeProvider";
import { LanguageProvider } from "./components/LanguageProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        toast.error("You need to log in to access this page");
        navigate("/auth", { replace: true });
      } else if (!isProfileComplete) {
        toast.info("Please complete your profile to continue");
        navigate("/profile-completion", { replace: true });
      }
    }
  }, [user, isLoading, isProfileComplete, navigate]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-campus-purple"></div>
    </div>;
  }
  
  // Only render children if user is logged in and profile is complete
  if (user && isProfileComplete) {
    return <>{children}</>;
  }
  
  // Return loading state while redirection happens
  return <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-campus-purple"></div>
  </div>;
};

// Home page with automatic redirection if logged in
const Home = () => {
  const { user, isLoading, isProfileComplete } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      if (!isProfileComplete) {
        navigate("/profile-completion", { replace: true });
      } else {
        navigate("/swap-requests", { replace: true });
      }
    }
  }, [user, isLoading, isProfileComplete, navigate]);

  return <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="campuslink-theme">
      <LanguageProvider defaultLanguage="en" storageKey="campuslink-language">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile-completion" element={<ProfileCompletion />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/swap-requests" element={
                    <ProtectedRoute>
                      <SwapRequests />
                    </ProtectedRoute>
                  } />
                  <Route path="/petitions" element={
                    <ProtectedRoute>
                      <Petitions />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
