import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CourseSelectionFieldsProps {
  courseName: string;
  customCourseName: string;
  courses: string[];
  setCourseName: (value: string) => void;
  setCustomCourseName: (value: string) => void;
}

// Static course names preserved from the translation files
const COURSE_TRANSLATIONS: { [key: string]: string } = {
  "Calculus I": "Calculus I",
  "Calculus II": "Calculus II",
  "Linear Algebra": "Linear Algebra",
  "Physics": "Physics",
  "Chemistry": "Chemistry",
  "Biology": "Biology",
  "Computer Science": "Computer Science",
  "Economics": "Economics",
  "Psychology": "Psychology",
  "Introduction to Programming": "Introduction to Programming",
  "Data Structures": "Data Structures",
  "Database Systems": "Database Systems",
  "Artificial Intelligence": "Artificial Intelligence",
  "Software Engineering": "Software Engineering",
  "Web Development": "Web Development",
  "Statistics": "Statistics",
  "Marketing": "Marketing",
  "Finance": "Finance",
  "Accounting": "Accounting",
  "Management": "Management",
  "English Literature": "English Literature",
  "Arabic Literature": "Arabic Literature",
  "History": "History",
  "Geography": "Geography",
  "Political Science": "Political Science",
  "Sociology": "Sociology",
  "other": "Other"
};

export const CourseSelectionFields = ({
  courseName,
  customCourseName,
  courses,
  setCourseName,
  setCustomCourseName
}: CourseSelectionFieldsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState<string[]>(courses);

  // Filter courses based on search query
  useEffect(() => {
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = courses.filter(course => 
        course.toLowerCase().includes(lowercaseQuery) || 
        (COURSE_TRANSLATIONS[course] && COURSE_TRANSLATIONS[course].toLowerCase().includes(lowercaseQuery))
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchQuery, courses]);

  // Reset search query when dropdown closes
  useEffect(() => {
    if (!isSelectOpen) {
      setSearchQuery("");
      setFilteredCourses(courses);
    }
  }, [isSelectOpen, courses]);

  return (
    <div className="space-y-2">
      <Label htmlFor="course" className="text-foreground">Course</Label>
      <Select 
        value={courseName} 
        onValueChange={setCourseName}
        onOpenChange={(open) => setIsSelectOpen(open)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a course" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 text-foreground max-h-[300px]">
          <div className="sticky top-0 p-2 bg-white dark:bg-gray-800 z-10 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="pl-8 text-sm"
              />
            </div>
          </div>
          
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <SelectItem key={course} value={course} className="cursor-pointer">
                {COURSE_TRANSLATIONS[course] || course}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-sm text-muted-foreground">
              No match found. You can type in the name of the desired course.
            </div>
          )}
          
          <SelectItem value="other" className="border-t mt-1 pt-1">
            + Add New Course
          </SelectItem>
        </SelectContent>
      </Select>
      
      {courseName === "other" && (
        <div className="mt-2">
          <Label htmlFor="custom-course" className="text-foreground">Enter Course Name</Label>
          <Input 
            id="custom-course" 
            value={customCourseName}
            onChange={(e) => setCustomCourseName(e.target.value)}
            placeholder="Enter Course Name"
            className="mt-1 text-foreground" 
          />
        </div>
      )}
    </div>
  );
};