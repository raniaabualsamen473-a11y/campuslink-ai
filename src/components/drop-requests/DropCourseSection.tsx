import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CourseDropdown } from "./CourseDropdown";
import { useState } from "react";

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
  const [customDropCourse, setCustomDropCourse] = useState("");

  const handleCourseChange = (value: string) => {
    onDropCourseChange(value === "other" ? customDropCourse : value);
  };

  return (
    <div className="space-y-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
      <h3 className="font-medium text-destructive">Course to Drop</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CourseDropdown
          label="Course Name"
          value={dropCourse === customDropCourse ? "other" : dropCourse}
          customValue={customDropCourse}
          onChange={handleCourseChange}
          onCustomChange={(value) => {
            setCustomDropCourse(value);
            onDropCourseChange(value);
          }}
          id="drop-course"
          placeholder="Select course to drop"
          required
        />

        <div className="space-y-2">
          <Label htmlFor="drop-section">Section Number *</Label>
          <Input
            id="drop-section"
            type="text"
            value={dropSectionNumber}
            onChange={(e) => onDropSectionChange(e.target.value)}
            placeholder="e.g., 1, 2, 3"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};