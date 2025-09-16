import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DropCourseSectionProps {
  dropCourse: string;
  dropSectionNumber: string;
  onDropCourseChange: (value: string) => void;
  onDropSectionChange: (value: string) => void;
}

export const DropCourseSection = ({
  dropCourse,
  dropSectionNumber,
  onDropCourseChange,
  onDropSectionChange
}: DropCourseSectionProps) => {
  return (
    <div className="space-y-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
      <h3 className="font-medium text-destructive">Course to Drop</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="drop-course">Course Name *</Label>
          <Input
            id="drop-course"
            value={dropCourse}
            onChange={(e) => onDropCourseChange(e.target.value)}
            placeholder="e.g., CS101"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="drop-section">Section Number *</Label>
          <Select value={dropSectionNumber} onValueChange={onDropSectionChange}>
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
    </div>
  );
};