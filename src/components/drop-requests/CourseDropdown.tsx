import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { COURSE_LIST, COURSE_TRANSLATIONS } from "@/utils/courseList";

interface CourseDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
  placeholder?: string;
}

export const CourseDropdown = ({
  label,
  value,
  onChange,
  id,
  placeholder = "Select a course"
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
        {label}
      </Label>
      <Select 
        value={value} 
        onValueChange={onChange}
        onOpenChange={(open) => setIsSelectOpen(open)}
      >
        <SelectTrigger className="border-2 border-purple-500/30 bg-purple-900/10 hover:border-purple-400/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 shadow-lg shadow-purple-500/10">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-background border-2 border-purple-500/30 text-foreground max-h-[300px] z-50 shadow-2xl shadow-purple-500/20">
          <div className="sticky top-0 p-2 bg-background z-10 border-b border-purple-500/20">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="pl-8 text-sm border-purple-500/30 focus:border-purple-400 focus:ring-purple-400/20"
              />
            </div>
          </div>
          
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <SelectItem key={course} value={course} className="cursor-pointer hover:bg-purple-500/10 focus:bg-purple-500/15">
                {COURSE_TRANSLATIONS[course] || course}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-sm text-muted-foreground">
              No courses found matching your search.
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};