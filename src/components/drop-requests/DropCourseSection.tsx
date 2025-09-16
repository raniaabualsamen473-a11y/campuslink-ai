import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CourseDropdown } from "./CourseDropdown";

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
    <div className="space-y-4 p-6 border-2 border-red-500/30 rounded-2xl bg-gradient-to-br from-red-900/10 to-pink-900/10 shadow-lg shadow-red-500/10 backdrop-blur-sm">
      <h3 className="font-semibold text-red-400 text-lg flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-400 shadow-lg shadow-red-400/50"></div>
        Course to Drop
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CourseDropdown
          label="Course Name"
          value={dropCourse}
          onChange={onDropCourseChange}
          id="drop-course"
          placeholder="Select course to drop"
        />

        <div className="space-y-2">
          <Label htmlFor="drop-section" className="text-foreground">Section Number</Label>
          <Input
            id="drop-section"
            type="text"
            value={dropSectionNumber}
            onChange={(e) => onDropSectionChange(e.target.value)}
            placeholder="e.g., 1, 2, 3"
            className="w-full border-2 border-red-500/30 bg-red-900/10 hover:border-red-400/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 shadow-lg shadow-red-500/10"
          />
        </div>
      </div>
    </div>
  );
};