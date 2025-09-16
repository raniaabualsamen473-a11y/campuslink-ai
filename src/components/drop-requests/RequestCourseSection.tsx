import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface RequestCourseSectionProps {
  requestCourse: string;
  requestSectionNumber: string;
  anySectionFlexible: boolean;
  onRequestCourseChange: (value: string) => void;
  onRequestSectionChange: (value: string) => void;
  onFlexibilityChange: (value: boolean) => void;
}

export const RequestCourseSection = ({
  requestCourse,
  requestSectionNumber,
  anySectionFlexible,
  onRequestCourseChange,
  onRequestSectionChange,
  onFlexibilityChange
}: RequestCourseSectionProps) => {
  return (
    <div className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
      <h3 className="font-medium text-primary">Course to Request</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="request-course">Course Name *</Label>
          <Input
            id="request-course"
            value={requestCourse}
            onChange={(e) => onRequestCourseChange(e.target.value)}
            placeholder="e.g., CS102"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="request-section">Section Preference</Label>
          <Select 
            value={requestSectionNumber} 
            onValueChange={onRequestSectionChange}
            disabled={anySectionFlexible}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  Section {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="any-section-flexible"
          checked={anySectionFlexible}
          onCheckedChange={onFlexibilityChange}
        />
        <Label htmlFor="any-section-flexible" className="text-sm cursor-pointer">
          Any section is fine
        </Label>
      </div>
    </div>
  );
};