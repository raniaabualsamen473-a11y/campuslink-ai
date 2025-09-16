import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { COURSE_LIST, COURSE_TRANSLATIONS } from "@/utils/courseList";

interface CourseDropdownProps {
  label: string;
  value: string;
  customValue: string;
  onChange: (value: string) => void;
  onCustomChange: (value: string) => void;
  id: string;
  placeholder?: string;
  required?: boolean;
}

export const CourseDropdown = ({
  label,
  value,
  customValue,
  onChange,
  onCustomChange,
  id,
  placeholder = "Select a course",
  required = false
}: CourseDropdownProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState<string[]>(COURSE_LIST);

  // Filter courses based on search query
  useEffect(() => {
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = COURSE_LIST.filter(course => 
        course.toLowerCase().includes(lowercaseQuery) || 
        (COURSE_TRANSLATIONS[course] && COURSE_TRANSLATIONS[course].toLowerCase().includes(lowercaseQuery))
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(COURSE_LIST);
    }
  }, [searchQuery]);

  // Reset search query when dropdown closes
  useEffect(() => {
    if (!isSelectOpen) {
      setSearchQuery("");
      setFilteredCourses(COURSE_LIST);
    }
  }, [isSelectOpen]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-foreground">
        {label} {required && "*"}
      </Label>
      <Select 
        value={value} 
        onValueChange={onChange}
        onOpenChange={(open) => setIsSelectOpen(open)}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-background border border-border text-foreground max-h-[300px] z-50">
          <div className="sticky top-0 p-2 bg-background z-10 border-b">
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
              No match found. You can add a custom course below.
            </div>
          )}
          
          <SelectItem value="other" className="border-t mt-1 pt-1">
            + Add New Course
          </SelectItem>
        </SelectContent>
      </Select>
      
      {value === "other" && (
        <div className="mt-2">
          <Label htmlFor={`${id}-custom`} className="text-foreground">Enter Course Name</Label>
          <Input 
            id={`${id}-custom`}
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="Enter Course Name"
            className="mt-1 text-foreground" 
          />
        </div>
      )}
    </div>
  );
};