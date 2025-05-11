
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const SwapInstructions = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-black">How it works</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="h-10 w-10 rounded-full bg-campus-purple text-white flex items-center justify-center mb-3">1</div>
          <h3 className="font-medium mb-2 text-black">Submit your request</h3>
          <p className="text-gray-700">Fill out the form with your current section and the section you want to swap to.</p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <div className="h-10 w-10 rounded-full bg-campus-purple text-white flex items-center justify-center mb-3">2</div>
          <h3 className="font-medium mb-2 text-black">Get matched</h3>
          <p className="text-gray-700">Our system will notify you when we find another student looking for a complementary swap.</p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <div className="h-10 w-10 rounded-full bg-campus-purple text-white flex items-center justify-center mb-3">3</div>
          <h3 className="font-medium mb-2 text-black">Complete the swap</h3>
          <p className="text-gray-700">Connect with your match and coordinate the swap through your university's course enrollment system.</p>
        </div>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-black">Important</AlertTitle>
        <AlertDescription className="text-black">
          ClassSwap helps you find matching students but does not guarantee a successful swap. The final swap must be processed through your university's official channels.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SwapInstructions;
