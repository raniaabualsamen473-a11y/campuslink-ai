import { useAuth } from "@/hooks/useAuth";
import { useDropRequests } from "@/hooks/useDropRequests";
import { DropRequestForm } from "@/components/drop-requests/DropRequestForm";
import { ActiveDropRequestsList } from "@/components/drop-requests/ActiveDropRequestsList";
import DropMatchResults from "@/components/DropMatchResults";

const DropRequests = () => {
  const { user } = useAuth();
  
  const {
    activeRequests,
    isLoading,
    editingRequestId,
    refreshTrigger,
    handleDeleteRequest,
    handleEditRequest,
    refreshRequests,
    cancelEditing
  } = useDropRequests(user?.id);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-4 text-foreground">Drop & Request</h1>
        
        {/* Neon Galaxy Introductory Message */}
        <div className="glass-card p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-blue-500/10 to-purple-500/10"></div>
          <div className="relative">
            <p className="text-lg leading-relaxed animate-glow-pulse"
               style={{
                 textShadow: `
                   0 0 10px hsl(var(--pink) / 0.8),
                   0 0 20px hsl(var(--blue) / 0.6),
                   0 0 30px hsl(var(--pink) / 0.4),
                   0 0 40px hsl(var(--blue) / 0.2)
                 `
               }}>
              This page is designed to make course changes easier. You can drop a course you no longer want so someone else can take it, request a course you'd like to join even if you're not currently enrolled, or drop one course while requesting another. This helps students connect and fill available spots fairly.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Request Form */}
        <div id="request-form" className="animate-fade-in" style={{animationDelay: "0.1s"}}>
          <div className="glass-card p-6 hover:shadow-neon-purple transition-all duration-300">
            <DropRequestForm 
              editingRequestId={editingRequestId}
              user={user}
              onRequestSubmitted={refreshRequests}
              onCancelEdit={cancelEditing}
            />
          </div>
        </div>

        {/* Active Requests */}
        <div className="animate-fade-in" style={{animationDelay: "0.2s"}}>
          <div className="glass-card p-6 hover:shadow-neon-purple transition-all duration-300">
            <ActiveDropRequestsList 
              requests={activeRequests}
              isLoading={isLoading}
              onEditRequest={handleEditRequest}
              onDeleteRequest={handleDeleteRequest}
            />
          </div>
        </div>

        {/* Matches */}
        <div className="animate-fade-in" style={{animationDelay: "0.3s"}}>
          <DropMatchResults refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default DropRequests;