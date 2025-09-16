import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CourseDropdown } from "./CourseDropdown";

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
    <div className="space-y-4 p-6 border-2 border-purple-500/30 rounded-2xl bg-gradient-to-br from-purple-900/10 to-blue-900/10 shadow-lg shadow-purple-500/10 backdrop-blur-sm">
      <h3 className="font-semibold text-purple-400 text-lg flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50"></div>
        Course to Request
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CourseDropdown
          label="Course Name"
          value={requestCourse}
          onChange={onRequestCourseChange}
          id="request-course"
          placeholder="Select course to request"
        />

        <div className="space-y-2">
          <Label htmlFor="request-section" className="text-foreground">Section Preference</Label>
          <Input
            id="request-section"
            type="text"
            value={requestSectionNumber}
            onChange={(e) => onRequestSectionChange(e.target.value)}
            placeholder="e.g., 1, 2, 3"
            className="w-full border-2 border-purple-500/30 bg-purple-900/10 hover:border-purple-400/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 shadow-lg shadow-purple-500/10 disabled:opacity-50"
            disabled={anySectionFlexible}
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 p-3 rounded-xl bg-purple-900/5 border border-purple-500/20">
        <Checkbox
          id="any-section-flexible"
          checked={anySectionFlexible}
          onCheckedChange={onFlexibilityChange}
          className="border-purple-500/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
        />
        <Label htmlFor="any-section-flexible" className="text-sm cursor-pointer text-purple-300">
          Any section is fine
        </Label>
      </div>
    </div>
  );
};