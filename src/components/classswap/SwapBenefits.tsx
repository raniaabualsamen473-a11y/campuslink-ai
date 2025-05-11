
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Users, Bell, Shield } from "lucide-react";

const SwapBenefits = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-black">Why use ClassSwap?</CardTitle>
        <CardDescription className="text-black">
          The easiest way to swap classes or petition for new sections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
            <div className="text-black">
              <span className="font-medium">Find matches quickly</span>
              <p className="text-sm text-gray-700">Our system automatically connects students looking to swap the same courses.</p>
            </div>
          </li>
          <li className="flex items-start">
            <Users className="h-5 w-5 mr-2 text-blue-600 mt-0.5" />
            <div className="text-black">
              <span className="font-medium">Private communication</span>
              <p className="text-sm text-gray-700">Connect directly with potential swap partners via Telegram.</p>
            </div>
          </li>
          <li className="flex items-start">
            <Bell className="h-5 w-5 mr-2 text-purple-600 mt-0.5" />
            <div className="text-black">
              <span className="font-medium">Get notified</span>
              <p className="text-sm text-gray-700">Receive instant notifications when we find a match for you.</p>
            </div>
          </li>
          <li className="flex items-start">
            <Shield className="h-5 w-5 mr-2 text-red-600 mt-0.5" />
            <div className="text-black">
              <span className="font-medium">Stay anonymous</span>
              <p className="text-sm text-gray-700">Option to keep your personal details private until a match is found.</p>
            </div>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-gray-700">
          Join hundreds of students already using ClassSwap to improve their schedules.
        </div>
      </CardFooter>
    </Card>
  );
};

export default SwapBenefits;
