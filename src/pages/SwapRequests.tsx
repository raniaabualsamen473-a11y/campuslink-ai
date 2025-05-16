
import { useAuth } from "@/hooks/useAuth";
import { useSwapRequests } from "@/hooks/useSwapRequests";
import { SwapRequestForm } from "@/components/swap-requests/SwapRequestForm";
import { ActiveRequestsList } from "@/components/swap-requests/ActiveRequestsList";
import MatchResults from "@/components/MatchResults";

const SwapRequests = () => {
  const { user } = useAuth();
  
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-campus-darkPurple">Class Swap Requests</h1>
        <p className="text-gray-600">
          Submit and manage your class section swap requests
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Request Form */}
        <div id="request-form">
          <SwapRequestForm 
            editingRequestId={editingRequestId}
            user={user}
            onRequestSubmitted={refreshRequests}
            onCancelEdit={cancelEditing}
          />
        </div>

        {/* Match Results */}
        <div>
          <MatchResults refreshTrigger={refreshTrigger} />
        </div>

        {/* Active Requests */}
        <div>
          <ActiveRequestsList 
            requests={activeRequests}
            onEditRequest={handleEditRequest}
            onDeleteRequest={handleDeleteRequest}
          />
        </div>
      </div>
    </div>
  );
};

export default SwapRequests;
