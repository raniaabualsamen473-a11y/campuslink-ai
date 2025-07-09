
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { SectionFields } from "./SectionFields";
import { ContactInfoFields } from "./ContactInfoFields";
import { CourseSelectionFields } from "./CourseSelectionFields";

import { useSwapRequestForm } from "@/hooks/useSwapRequestForm";

interface SwapRequestFormProps {
  editingRequestId: string | null;
  user: any;
  onRequestSubmitted: () => void;
  onCancelEdit: () => void;
}

export const SwapRequestForm = ({ 
  editingRequestId,
  user,
  onRequestSubmitted,
  onCancelEdit 
}: SwapRequestFormProps) => {
  const { 
    isLoading,
    isAnonymous,
    requestType,
    semester,
    courseName,
    customCourseName,
    telegramUsername,
    reason,
    currentSectionNumber,
    currentDaysPattern,
    currentStartTime,
    desiredSectionNumber,
    desiredDaysPattern,
    desiredStartTime,
    currentTimeSlots,
    desiredTimeSlots,
    summerFormat,
    courses,
    setIsAnonymous,
    setRequestType,
    setSemester,
    setCourseName,
    setCustomCourseName,
    setTelegramUsername,
    setReason,
    setCurrentSectionNumber,
    setCurrentDaysPattern,
    setCurrentStartTime,
    setDesiredSectionNumber,
    setDesiredDaysPattern,
    setDesiredStartTime,
    setSummerFormat,
    handleSwapSubmit,
    resetForm,
    handleSemesterChange
  } = useSwapRequestForm({
    editingRequestId,
    user,
    onRequestSubmitted,
    onCancelEdit
  });

  return (
    <Card className="border-campus-purple/20">
      <CardHeader>
        <CardTitle className="text-campus-darkPurple">
          {editingRequestId ? "Edit Request" : "New Request"}
        </CardTitle>
        <CardDescription className="text-gray-700">
          {editingRequestId 
            ? "Modify your existing class section swap request" 
            : "Create a new class section swap request"
          }
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSwapSubmit}>
        <CardContent>
          <div className="space-y-6">
            {/* Semester Selection */}
            <div className="space-y-2">
              <Label htmlFor="semester" className="text-black">Semester</Label>
              <Select defaultValue={semester} value={semester} onValueChange={handleSemesterChange}>
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular Semester</SelectItem>
                  <SelectItem value="summer">Summer Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Course Selection */}
            <CourseSelectionFields
              courseName={courseName}
              customCourseName={customCourseName}
              courses={courses}
              setCourseName={setCourseName}
              setCustomCourseName={setCustomCourseName}
            />

            {/* Current Section */}
            <SectionFields
              type="current"
              sectionNumber={currentSectionNumber}
              daysPattern={currentDaysPattern}
              startTime={currentStartTime}
              timeSlots={currentTimeSlots}
              setNumber={setCurrentSectionNumber}
              setDaysPattern={setCurrentDaysPattern}
              setStartTime={setCurrentStartTime}
              semester={semester}
            />
            
            {/* Desired Section */}
            <SectionFields
              type="desired"
              sectionNumber={desiredSectionNumber}
              daysPattern={desiredDaysPattern}
              startTime={desiredStartTime}
              timeSlots={desiredTimeSlots}
              setNumber={setDesiredSectionNumber}
              setDaysPattern={setDesiredDaysPattern}
              setStartTime={setDesiredStartTime}
              semester={semester}
            />

            {/* Contact Information */}
            <ContactInfoFields
              telegramUsername={telegramUsername}
              isAnonymous={isAnonymous}
              setTelegramUsername={setTelegramUsername}
              setIsAnonymous={setIsAnonymous}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {editingRequestId && (
            <Button 
              type="button"
              variant="outline"
              onClick={resetForm}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isLoading}
            className={`${editingRequestId ? '' : 'ml-auto'} bg-campus-purple hover:bg-campus-darkPurple text-white`}
          >
            {isLoading 
              ? editingRequestId 
                ? "Saving Changes..." 
                : "Submitting Request..." 
              : editingRequestId
                ? "Save Changes"
                : "Submit Swap Request"
            }
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
