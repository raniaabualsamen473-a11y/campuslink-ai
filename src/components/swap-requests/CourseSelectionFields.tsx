
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslate } from "@/components/LanguageProvider";
import { Search, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  courses = [], // Provide default empty array
  setCourseName,
  setCustomCourseName
}: CourseSelectionFieldsProps) => {
  const { t, language } = useTranslate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // Initialize filteredCourses with the full course list
  useEffect(() => {
    // Ensure courses is always an array even if it's undefined
    setFilteredCourses(Array.isArray(courses) ? courses : []);
  }, [courses]);

  // Filter courses based on search query
  useEffect(() => {
    // Ensure courses is always an array
    const coursesList = Array.isArray(courses) ? courses : [];
    
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = coursesList.filter(course => 
        course.toLowerCase().includes(lowercaseQuery) || 
        (language === 'ar' && t(`courses.${course}`, { defaultValue: course }).toLowerCase().includes(lowercaseQuery))
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(coursesList);
    }
  }, [searchQuery, courses, language, t]);

  const handleSelect = (value: string) => {
    setCourseName(value);
    setOpen(false);
    setSearchQuery("");
  };

  const clearSelection = () => {
    setCourseName("");
    setCustomCourseName("");
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="course" className="text-foreground">{t('courses.Course')}</Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white dark:bg-gray-900 border-input h-10"
          >
            <span className="truncate">
              {courseName === "other" 
                ? customCourseName || t('courses.Add New Course')
                : courseName 
                  ? (language === 'ar' ? t(`courses.${courseName}`, { defaultValue: courseName }) : courseName)
                  : t('courses.Select a course')
              }
            </span>
            {courseName && (
              <X 
                className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100" 
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
              />
            )}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command className="rounded-lg border shadow-md">
            <CommandInput
              placeholder={t('courses.Search courses...')}
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-9"
            />
            <CommandEmpty>
              {t('courses.No match found. You can type in the name of the desired course.')}
              <Button
                variant="ghost"
                onClick={() => handleSelect("other")}
                className="w-full justify-start text-left mt-2 text-sm text-campus-purple"
              >
                + {t('courses.Add New Course')}
              </Button>
            </CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {filteredCourses && filteredCourses.length > 0 && filteredCourses.map((course) => (
                <CommandItem
                  key={course}
                  value={course}
                  onSelect={() => handleSelect(course)}
                  className="cursor-pointer"
                >
                  <span>{language === 'ar' ? t(`courses.${course}`, { defaultValue: course }) : course}</span>
                </CommandItem>
              ))}
              <CommandItem onSelect={() => handleSelect("other")} className="border-t mt-1 pt-1">
                + {t('courses.Add New Course')}
              </CommandItem>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      {courseName === "other" && (
        <div className="mt-2">
          <Label htmlFor="custom-course" className="text-foreground">{t('courses.Enter Course Name')}</Label>
          <Input 
            id="custom-course" 
            value={customCourseName}
            onChange={(e) => setCustomCourseName(e.target.value)}
            placeholder={t('courses.Enter Course Name')}
            className="mt-1 text-foreground bg-white dark:bg-gray-900" 
          />
        </div>
      )}
    </div>
  );
};
