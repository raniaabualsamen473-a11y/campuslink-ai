import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropRequest } from "@/types/drop";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface ActiveDropRequestsListProps {
  requests: DropRequest[];
  isLoading: boolean;
  onEditRequest: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

export const ActiveDropRequestsList = ({ requests, isLoading, onEditRequest, onDeleteRequest }: ActiveDropRequestsListProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Active Drop Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading your requests...</p>
        </CardContent>
      </Card>
    );
  }

  const getActionTypeLabel = (actionType: string) => {
    switch (actionType) {
      case 'drop_only':
        return 'Drop Only';
      case 'request_only':
        return 'Request Only';
      case 'drop_and_request':
        return 'Drop & Request';
      default:
        return actionType;
    }
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case 'drop_only':
        return 'destructive';
      case 'request_only':
        return 'default';
      case 'drop_and_request':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Active Drop Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No active drop requests. Create your first request above.
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getActionTypeColor(request.action_type) as any}>
                        {getActionTypeLabel(request.action_type)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      {request.drop_course && (
                        <p>
                          <span className="text-destructive font-medium">Drop:</span>{' '}
                          {request.drop_course} Section {request.drop_section_number}
                        </p>
                      )}
                      
                      {request.request_course && (
                        <p>
                          <span className="text-primary font-medium">Request:</span>{' '}
                          {request.request_course}{' '}
                          {request.any_section_flexible ? (
                            <span className="text-muted-foreground">(Any section)</span>
                          ) : (
                            `Section ${request.request_section_number}`
                          )}
                        </p>
                      )}
                      
                      <p className="text-muted-foreground">
                        Created: {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditRequest(request.id)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteRequest(request.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};