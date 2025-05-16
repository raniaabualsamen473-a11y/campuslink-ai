
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Users, Bell, Shield } from "lucide-react";

const SwapBenefits = () => {
  return (
    <Card className="shadow-md bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Why use ClassSwap?</CardTitle>
        <CardDescription>
          The easiest way to swap classes or petition for new sections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 dark:text-green-400 mt-0.5" />
            <div className="text-foreground">
              <span className="font-medium">Find matches quickly</span>
              <p className="text-sm text-muted-foreground">Our system automatically connects students looking to swap the same courses.</p>
            </div>
          </li>
          <li className="flex items-start">
            <Users className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400 mt-0.5" />
            <div className="text-foreground">
              <span className="font-medium">Private communication</span>
              <p className="text-sm text-muted-foreground">Connect directly with potential swap partners via Telegram.</p>
            </div>
          </li>
          <li className="flex items-start">
            <Bell className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400 mt-0.5" />
            <div className="text-foreground">
              <span className="font-medium">Get notified</span>
              <p className="text-sm text-muted-foreground">Receive instant notifications when we find a match for you.</p>
            </div>
          </li>
          <li className="flex items-start">
            <Shield className="h-5 w-5 mr-2 text-red-500 dark:text-red-400 mt-0.5" />
            <div className="text-foreground">
              <span className="font-medium">Stay anonymous</span>
              <p className="text-sm text-muted-foreground">Option to keep your personal details private until a match is found.</p>
            </div>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          Join hundreds of students already using ClassSwap to improve their schedules.
        </div>
      </CardFooter>
    </Card>
  );
};

export default SwapBenefits;
