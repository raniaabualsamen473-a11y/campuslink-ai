
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface PetitionReasonFieldProps {
  reason: string;
  setReason: (value: string) => void;
}

export const PetitionReasonField = ({
  reason,
  setReason
}: PetitionReasonFieldProps) => {
  const maxLength = 500;
  const [characterCount, setCharacterCount] = useState(reason.length);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setReason(value);
      setCharacterCount(value.length);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="reason" className="text-black">Reason for Petition</Label>
      <textarea 
        id="reason" 
        placeholder="Why do you need this section?" 
        className="w-full min-h-[100px] px-3 py-2 border rounded-md"
        value={reason}
        onChange={handleChange}
        maxLength={maxLength}
      />
      <div className="flex justify-between text-xs">
        <p className="text-gray-500">
          Explaining your reason may help gather support for your petition
        </p>
        <p className={`${characterCount > maxLength * 0.8 ? 'text-amber-500' : 'text-gray-500'}`}>
          {characterCount}/{maxLength}
        </p>
      </div>
    </div>
  );
};
