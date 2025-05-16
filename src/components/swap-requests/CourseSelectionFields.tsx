
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useTranslate } from "@/components/LanguageProvider";
import { Search } from "lucide-react";

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
  const { t, language } = useTranslate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState<string[]>(courses);

  // Filter courses based on search query
  useEffect(() => {
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = courses.filter(course => 
        course.toLowerCase().includes(lowercaseQuery) || 
        (language === 'ar' && t(`courses.${course}`, { defaultValue: course }).toLowerCase().includes(lowercaseQuery))
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchQuery, courses, language, t]);

  // Reset search query when dropdown closes
  useEffect(() => {
    if (!isSelectOpen) {
      setSearchQuery("");
      setFilteredCourses(courses);
    }
  }, [isSelectOpen, courses]);

  return (
    <div className="space-y-2">
      <Label htmlFor="course" className="text-foreground">{t('courses.Course')}</Label>
      <Select 
        value={courseName} 
        onValueChange={setCourseName}
        onOpenChange={(open) => setIsSelectOpen(open)}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('courses.Select a course')} />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 text-foreground max-h-[300px]">
          <div className="sticky top-0 p-2 bg-white dark:bg-gray-800 z-10 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('courses.Search courses...')}
                className="pl-8 text-sm"
              />
            </div>
          </div>
          
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <SelectItem key={course} value={course} className="cursor-pointer">
                {language === 'ar' ? t(`courses.${course}`, { defaultValue: course }) : course}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-sm text-muted-foreground">
              {t('courses.No match found. You can type in the name of the desired course.')}
            </div>
          )}
          
          <SelectItem value="other" className="border-t mt-1 pt-1">
            + {t('courses.Add New Course')}
          </SelectItem>
        </SelectContent>
      </Select>
      
      {courseName === "other" && (
        <div className="mt-2">
          <Label htmlFor="custom-course" className="text-foreground">{t('courses.Enter Course Name')}</Label>
          <Input 
            id="custom-course" 
            value={customCourseName}
            onChange={(e) => setCustomCourseName(e.target.value)}
            placeholder={t('courses.Enter Course Name')}
            className="mt-1 text-foreground" 
          />
        </div>
      )}
    </div>
  );
};
