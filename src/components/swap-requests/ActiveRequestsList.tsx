
import { SwapRequest } from "@/types/swap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ActiveRequestsListProps {
  requests: SwapRequest[];
  onEditRequest: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

export const ActiveRequestsList = ({ 
  requests, 
  onEditRequest, 
  onDeleteRequest 
}: ActiveRequestsListProps) => {
  return (
    <Card className="border-campus-purple/20">
      <CardHeader>
        <CardTitle className="text-foreground">Your Active Requests</CardTitle>
        <CardDescription>
          View and manage your current swap requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.length > 0 ? (
            requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 glass-card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground">
                    {request.desired_course || "Unnamed Course"}
                  </h3>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-100 rounded-full text-xs">
                    {request.petition ? "Petition" : "Swap Request"}
                  </span>
                </div>
                {!request.petition && request.current_section && (
                  <p className="text-sm mb-1 text-foreground">
                    <span className="text-muted-foreground">From: </span>
                    {request.current_section}
                  </p>
                )}
                <p className="text-sm mb-2 text-foreground">
                  <span className="text-muted-foreground">To: </span>
                  {request.desired_section || "Any available section"}
                </p>
                <Separator className="my-2" />
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                  <span>Created: {new Date(request.created_at || "").toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onEditRequest(request.id)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => onDeleteRequest(request.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No active requests</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
