import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ActionType } from "@/types/drop";

interface ActionTypeSelectorProps {
  value: ActionType;
  onChange: (value: ActionType) => void;
}

export const ActionTypeSelector = ({ value, onChange }: ActionTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Action Type</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange as (value: string) => void}
        className="grid grid-cols-1 gap-4"
      >
        <div className="flex items-center space-x-4 p-4 rounded-xl border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/10 to-pink-900/10 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 backdrop-blur-sm">
          <RadioGroupItem 
            value="drop_only" 
            id="drop_only" 
            className="border-purple-500/50 text-purple-400 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500" 
          />
          <div className="flex-1">
            <Label htmlFor="drop_only" className="font-medium cursor-pointer text-purple-200">
              Drop Only
            </Label>
            <p className="text-sm text-purple-300/70 mt-1">
              Drop a course you no longer want so someone else can take it
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4 rounded-xl border-2 border-blue-500/30 bg-gradient-to-r from-blue-900/10 to-purple-900/10 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 backdrop-blur-sm">
          <RadioGroupItem 
            value="request_only" 
            id="request_only" 
            className="border-blue-500/50 text-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" 
          />
          <div className="flex-1">
            <Label htmlFor="request_only" className="font-medium cursor-pointer text-blue-200">
              Request Only
            </Label>
            <p className="text-sm text-blue-300/70 mt-1">
              Request a course you'd like to join even if you're not currently enrolled
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4 rounded-xl border-2 border-indigo-500/30 bg-gradient-to-r from-indigo-900/10 to-purple-900/10 hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 backdrop-blur-sm">
          <RadioGroupItem 
            value="drop_and_request" 
            id="drop_and_request" 
            className="border-indigo-500/50 text-indigo-400 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500" 
          />
          <div className="flex-1">
            <Label htmlFor="drop_and_request" className="font-medium cursor-pointer text-indigo-200">
              Drop and Request
            </Label>
            <p className="text-sm text-indigo-300/70 mt-1">
              Drop one course while requesting another different course
            </p>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};