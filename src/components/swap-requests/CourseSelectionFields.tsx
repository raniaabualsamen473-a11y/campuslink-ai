
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface CourseSelectionFieldsProps {
  courseName: string;
  customCourseName: string;
  courses: string[];
  setCourseName: (value: string) => void;
  setCustomCourseName: (value: string) => void;
}

export const CourseSelectionFields = ({
  courseName,
  customCourseName,
  courses,
  setCourseName,
  setCustomCourseName
}: CourseSelectionFieldsProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="course" className="text-black">Course</Label>
      <Select value={courseName} onValueChange={setCourseName}>
        <SelectTrigger>
          <SelectValue placeholder="Select a course" />
        </SelectTrigger>
        <SelectContent>
          {courses.map((course) => (
            <SelectItem key={course} value={course}>
              {course}
            </SelectItem>
          ))}
          <SelectItem value="other">
            + Add New Course
          </SelectItem>
        </SelectContent>
      </Select>
      
      {courseName === "other" && (
        <div className="mt-2">
          <Label htmlFor="custom-course" className="text-black">Enter Course Name</Label>
          <Input 
            id="custom-course" 
            value={customCourseName}
            onChange={(e) => setCustomCourseName(e.target.value)}
            placeholder="Enter course name"
            className="mt-1" 
          />
        </div>
      )}
    </div>
  );
};
