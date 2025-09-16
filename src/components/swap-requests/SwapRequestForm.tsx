
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { SectionFields } from "./SectionFields";

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
              <Label htmlFor="semester" className="text-foreground">Semester</Label>
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

          </div>
        </CardContent>
        
        {/* Warning Message */}
        <div className="px-6 pb-4">
          <Alert className="glass-card border-2 border-red-500/30 bg-gradient-to-r from-red-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-md shadow-neon-red dark:shadow-[0_0_20px_rgba(239,68,68,0.3),0_0_40px_rgba(59,130,246,0.2)] animate-glow-pulse">
            <TriangleAlert className="h-4 w-4 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <AlertDescription className="text-red-100 dark:text-red-200 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
              <strong>Important:</strong> Matches are made by course and section number only. Same sections should have identical day and time patterns.
            </AlertDescription>
          </Alert>
        </div>
        
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
