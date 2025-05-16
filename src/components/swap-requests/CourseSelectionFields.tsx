
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useTranslate } from "@/components/LanguageProvider";

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

  return (
    <div className="space-y-2">
      <Label htmlFor="course" className="text-foreground">{t('courses.Course')}</Label>
      <Select value={courseName} onValueChange={setCourseName}>
        <SelectTrigger>
          <SelectValue placeholder={t('courses.Select a course')} />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 text-foreground">
          {courses.map((course) => (
            <SelectItem key={course} value={course}>
              {language === 'ar' && t(`courses.${course}`, { defaultValue: course }) || course}
            </SelectItem>
          ))}
          <SelectItem value="other">
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
