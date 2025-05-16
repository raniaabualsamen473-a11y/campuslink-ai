
import { Label } from "@/components/ui/label";

interface PetitionReasonFieldProps {
  reason: string;
  setReason: (value: string) => void;
}

export const PetitionReasonField = ({
  reason,
  setReason
}: PetitionReasonFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="reason" className="text-black">Reason for Petition</Label>
      <textarea 
        id="reason" 
        placeholder="Why do you need this section?" 
        className="w-full min-h-[100px] px-3 py-2 border rounded-md"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <p className="text-xs text-gray-500 mt-1">
        Explaining your reason may help gather support for your petition
      </p>
    </div>
  );
};
