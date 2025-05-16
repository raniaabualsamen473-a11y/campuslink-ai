
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCcw, Users, MessageSquare } from "lucide-react";
import { useTranslate } from "@/components/LanguageProvider";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslate();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12 animate-fade-in">
        <div className="flex justify-center mb-6">
          <img 
            src="https://pbqpbupsmzafbzlxccov.supabase.co/storage/v1/object/public/logo//CampusLink.ai(Logo)%20(Logo).png" 
            alt="CampusLink AI Logo" 
            className="h-24 w-24 object-contain animate-float"
          />
        </div>
        <h1 className="text-5xl font-bold text-campus-purple mb-4">
          CampusLink <span className="text-campus-lightPurple">AI</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('home.tagline')}
        </p>
        
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {user ? (
            <Button 
              onClick={() => navigate("/swap-requests")}
              variant="neon"
              size="lg"
              className="btn-glow"
            >
              <RefreshCcw className="mr-2 h-5 w-5" />
              {t('home.viewSwapRequests')}
            </Button>
          ) : (
            <Button 
              onClick={() => navigate("/auth")}
              variant="neon"
              size="lg"
              className="btn-glow"
            >
              {t('home.getStarted')}
            </Button>
          )}
          
          <Button 
            variant="glass" 
            size="lg"
            asChild
          >
            <a href="#features">{t('home.learnMore')}</a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16" id="features">
        <Card className="hover:shadow-neon-purple transition-all duration-500 animate-fade-in" style={{animationDelay: "0.1s"}}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-campus-purple/10 p-3 mb-4 neon-glow">
                <RefreshCcw className="h-8 w-8 text-campus-purple" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-foreground">{t('home.features.swapping.title')}</h2>
              <p className="text-muted-foreground">
                {t('home.features.swapping.description')}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-neon-purple transition-all duration-500 animate-fade-in" style={{animationDelay: "0.3s"}}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-campus-purple/10 p-3 mb-4 neon-glow">
                <Users className="h-8 w-8 text-campus-purple" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-foreground">{t('home.features.petitions.title')}</h2>
              <p className="text-muted-foreground">
                {t('home.features.petitions.description')}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-neon-purple transition-all duration-500 animate-fade-in" style={{animationDelay: "0.5s"}}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-campus-purple/10 p-3 mb-4 neon-glow">
                <MessageSquare className="h-8 w-8 text-campus-purple" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-foreground">{t('home.features.communication.title')}</h2>
              <p className="text-muted-foreground">
                {t('home.features.communication.description')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-campus-purple mb-6">
          {t('home.howItWorks.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center animate-fade-in" style={{animationDelay: "0.2s"}}>
            <div className="bg-campus-purple/10 rounded-full w-12 h-12 flex items-center justify-center mb-4 neon-glow">
              <span className="text-xl font-bold text-campus-purple">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">{t('home.howItWorks.step1.title')}</h3>
            <p className="text-muted-foreground">
              {t('home.howItWorks.step1.description')}
            </p>
          </div>
          
          <div className="flex flex-col items-center animate-fade-in" style={{animationDelay: "0.4s"}}>
            <div className="bg-campus-purple/10 rounded-full w-12 h-12 flex items-center justify-center mb-4 neon-glow">
              <span className="text-xl font-bold text-campus-purple">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">{t('home.howItWorks.step2.title')}</h3>
            <p className="text-muted-foreground">
              {t('home.howItWorks.step2.description')}
            </p>
          </div>
          
          <div className="flex flex-col items-center animate-fade-in" style={{animationDelay: "0.6s"}}>
            <div className="bg-campus-purple/10 rounded-full w-12 h-12 flex items-center justify-center mb-4 neon-glow">
              <span className="text-xl font-bold text-campus-purple">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">{t('home.howItWorks.step3.title')}</h3>
            <p className="text-muted-foreground">
              {t('home.howItWorks.step3.description')}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center glass py-8 px-4 rounded-3xl backdrop-blur-md animate-fade-in" style={{animationDelay: "0.8s"}}>
        <h2 className="text-2xl font-bold text-campus-purple mb-6">
          {t('home.readyToStart')}
        </h2>
        
        {user ? (
          <Button 
            onClick={() => navigate("/swap-requests")}
            variant="neon"
            size="lg"
            className="btn-glow"
          >
            {t('home.viewSwapRequests')}
          </Button>
        ) : (
          <Button 
            onClick={() => navigate("/auth")}
            variant="neon"
            size="lg"
            className="btn-glow"
          >
            {t('home.signUpNow')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Index;
