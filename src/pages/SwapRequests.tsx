
import { useAuth } from "@/hooks/useAuth";
import { useSwapRequests } from "@/hooks/useSwapRequests";
import { SwapRequestForm } from "@/components/swap-requests/SwapRequestForm";
import { ActiveRequestsList } from "@/components/swap-requests/ActiveRequestsList";
import MatchResults from "@/components/MatchResults";
import { useTranslate } from "@/components/LanguageProvider";

const SwapRequests = () => {
  const { user } = useAuth();
  const { t } = useTranslate();
  
  const {
    activeRequests,
    editingRequestId,
    refreshTrigger,
    handleDeleteRequest,
    handleEditRequest,
    refreshRequests,
    cancelEditing
  } = useSwapRequests(user?.id);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 text-foreground">{t('swapRequests.title')}</h1>
        <p className="text-muted-foreground">
          {t('swapRequests.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Request Form */}
        <div id="request-form" className="animate-fade-in" style={{animationDelay: "0.1s"}}>
          <div className="glass-card p-6 hover:shadow-neon-purple transition-all duration-300">
            <SwapRequestForm 
              editingRequestId={editingRequestId}
              user={user}
              onRequestSubmitted={refreshRequests}
              onCancelEdit={cancelEditing}
            />
          </div>
        </div>

        {/* Match Results */}
        <div className="animate-fade-in" style={{animationDelay: "0.2s"}}>
          <div className="glass-card p-6 hover:shadow-neon-purple transition-all duration-300">
            <MatchResults refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Active Requests */}
        <div className="animate-fade-in" style={{animationDelay: "0.3s"}}>
          <div className="glass-card p-6 hover:shadow-neon-purple transition-all duration-300">
            <ActiveRequestsList 
              requests={activeRequests}
              onEditRequest={handleEditRequest}
              onDeleteRequest={handleDeleteRequest}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapRequests;
