import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ActionType } from "@/types/drop";

interface ActionTypeSelectorProps {
  value: ActionType;
  onChange: (value: ActionType) => void;
}

export const ActionTypeSelector = ({ value, onChange }: ActionTypeSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Action Type</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange as (value: string) => void}
        className="grid grid-cols-1 gap-3"
      >
        <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="drop_only" id="drop_only" />
          <div className="flex-1">
            <Label htmlFor="drop_only" className="font-medium cursor-pointer">
              Drop Only
            </Label>
            <p className="text-sm text-muted-foreground">
              Drop a course you no longer want so someone else can take it
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="request_only" id="request_only" />
          <div className="flex-1">
            <Label htmlFor="request_only" className="font-medium cursor-pointer">
              Request Only
            </Label>
            <p className="text-sm text-muted-foreground">
              Request a course you'd like to join even if you're not currently enrolled
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="drop_and_request" id="drop_and_request" />
          <div className="flex-1">
            <Label htmlFor="drop_and_request" className="font-medium cursor-pointer">
              Drop and Request
            </Label>
            <p className="text-sm text-muted-foreground">
              Drop one course while requesting another different course
            </p>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};