import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CourseDropdown } from "./CourseDropdown";
import { useState } from "react";

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
  const [customRequestCourse, setCustomRequestCourse] = useState("");

  const handleCourseChange = (value: string) => {
    onRequestCourseChange(value === "other" ? customRequestCourse : value);
  };

  return (
    <div className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
      <h3 className="font-medium text-primary">Course to Request</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CourseDropdown
          label="Course Name"
          value={requestCourse === customRequestCourse ? "other" : requestCourse}
          customValue={customRequestCourse}
          onChange={handleCourseChange}
          onCustomChange={(value) => {
            setCustomRequestCourse(value);
            onRequestCourseChange(value);
          }}
          id="request-course"
          placeholder="Select course to request"
          required
        />

        <div className="space-y-2">
          <Label htmlFor="request-section">Section Preference</Label>
          <Input
            id="request-section"
            type="text"
            value={requestSectionNumber}
            onChange={(e) => onRequestSectionChange(e.target.value)}
            placeholder="e.g., 1, 2, 3"
            className="w-full"
            disabled={anySectionFlexible}
          />
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