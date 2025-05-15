import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { normalizeSection } from "@/utils/sectionUtils";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Clock, Calendar } from "lucide-react";

// Define the form validation schema
const formSchema = z.object({
  course: z.string().min(1, "Course is required"),
  currentSection: z.string().optional(),
  targetSection: z.string().min(1, "Target section is required"),
  isPetition: z.boolean().default(false),
  isAnonymous: z.boolean().default(false),
  fullName: z.string().optional(),
  telegramUsername: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  // New fields for time and day pattern
  dayPattern: z.string().optional(),
  preferredTime: z.string().optional(),
  reason: z.string().optional(),
  summerFormat: z.string().optional(),
  flexibleTime: z.boolean().default(false),
  flexibleDays: z.boolean().default(false),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Sample courses for the dropdown - in a real app, these would come from an API or database
const sampleCourses = [
  "CS101: Introduction to Computer Science",
  "BIO201: Cell Biology",
  "MATH110: Calculus I",
  "ENG220: Modern Literature",
  "PHYS150: Physics for Scientists and Engineers",
];

// Sample sections for the dropdown - in a real app, these would come from an API or database
const sampleSections = ["A", "B", "C", "D", "E", "F"];

// Time slots with visual representation
const timeSlots = [
  { value: "8am", label: "8:00 AM", icon: <Clock className="w-4 h-4 mr-2" /> },
  { value: "9am", label: "9:00 AM", icon: <Clock className="w-4 h-4 mr-2" /> },
  { value: "10am", label: "10:00 AM", icon: <Clock className="w-4 h-4 mr-2" /> },
  { value: "11am", label: "11:00 AM", icon: <Clock className="w-4 h-4 mr-2" /> },
  { value: "12pm", label: "12:00 PM", icon: <Clock className="w-4 h-4 mr-2" /> },
  { value: "1pm", label: "1:00 PM", icon: <Clock className="w-4 h-4 mr-2" /> },
  { value: "2pm", label: "2:00 PM", icon: <Clock className="w-4 h-4 mr-2" /> },
  { value: "3pm", label: "3:00 PM", icon: <Clock className="w-4 h-4 mr-2" /> },
  { value: "4pm", label: "4:00 PM", icon: <Clock className="w-4 h-4 mr-2" /> },
  { value: "5pm", label: "5:00 PM", icon: <Clock className="w-4 h-4 mr-2" /> },
];

// Day patterns with clear labels
const dayPatterns = [
  { value: "mw", label: "Monday/Wednesday (MW)", days: ["Monday", "Wednesday"] },
  { value: "stt", label: "Sunday/Tuesday/Thursday (STT)", days: ["Sunday", "Tuesday", "Thursday"] },
];

// Summer format patterns with clear descriptions
const summerFormats = [
  { value: "everyday", label: "Every day (Sun-Thu)" },
  { value: "firstTwoDays", label: "First two days (Sun-Mon)" },
  { value: "lastThreeDays", label: "Last three days (Tue-Thu)" },
];

const SwapForm = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [semesterType, setSemesterType] = useState("regular");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course: "",
      currentSection: "",
      targetSection: "",
      isPetition: false,
      isAnonymous: false,
      fullName: "",
      telegramUsername: "",
      email: user?.email || "",
      dayPattern: "mw",
      preferredTime: "",
      reason: "",
      summerFormat: "everyday",
      flexibleTime: false,
      flexibleDays: false,
      notes: "",
    },
  });

  const watchIsPetition = form.watch("isPetition");

  const handleSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to submit a swap request");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get final values (using custom input if provided)
      const finalCourseName = data.course;
      const finalCurrentSection = watchIsPetition ? null : normalizeSection(data.currentSection || '');
      const finalTargetSection = normalizeSection(data.targetSection || '');
      
      // Prepare the data for submission
      const requestData = {
        desired_course: finalCourseName,
        current_section: watchIsPetition ? null : finalCurrentSection,
        desired_section: finalTargetSection,
        petition: data.isPetition,
        anonymous: data.isAnonymous,
        full_name: data.isAnonymous ? null : data.fullName,
        telegram_username: data.telegramUsername || null,
        email: data.email || user.email,
        user_id: user.id,
        days_pattern: semesterType === "regular" ? data.dayPattern : null,
        preferred_time: data.isPetition ? data.preferredTime : null,
        reason: data.isPetition ? data.reason : null,
        summer_format: semesterType === "summer" ? data.summerFormat : null,
        flexible_time: data.flexibleTime,
        flexible_days: data.flexibleDays,
        notes: data.notes,
      };

      // Submit to Supabase
      const { error } = await supabase
        .from('swap_requests')
        .insert([requestData]);

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Your request has been submitted successfully!");
      form.reset();
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error(`Failed to submit request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>Enter the course and section details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Semester Selection */}
            <div className="mb-6">
              <Tabs defaultValue="regular" onValueChange={setSemesterType}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="regular">Regular Semester</TabsTrigger>
                  <TabsTrigger value="summer">Summer Semester</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Petition or Swap Selection */}
            <div className="mb-6">
              <Tabs onValueChange={(value) => form.setValue("isPetition", value === "petition")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="swap">Swap Request</TabsTrigger>
                  <TabsTrigger value="petition">Section Petition</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Course Selection */}
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Courses</SelectLabel>
                        {sampleCourses.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Add Custom Course</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {field.value === "custom" && (
                    <Input
                      className="mt-2"
                      placeholder="Enter course name (e.g., CS202: Advanced Programming)"
                      onChange={(e) => form.setValue("course", e.target.value)}
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Section - Only show if not petition */}
            {!watchIsPetition && (
              <FormField
                control={form.control}
                name="currentSection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Section</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your current section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Sections</SelectLabel>
                          {sampleSections.map((section) => (
                            <SelectItem key={section} value={section}>
                              Section {section}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Add Custom Section</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {field.value === "custom" && (
                      <Input
                        className="mt-2"
                        placeholder="Enter section (e.g., G, H1, etc.)"
                        onChange={(e) => form.setValue("currentSection", e.target.value)}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Target Section */}
            <FormField
              control={form.control}
              name="targetSection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Section</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select desired section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Sections</SelectLabel>
                        {sampleSections.map((section) => (
                          <SelectItem key={section} value={section}>
                            Section {section}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Add Custom Section</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {field.value === "custom" && (
                    <Input
                      className="mt-2"
                      placeholder="Enter section (e.g., G, H1, etc.)"
                      onChange={(e) => form.setValue("targetSection", e.target.value)}
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Preferences</CardTitle>
            <CardDescription>Specify your scheduling preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Days Pattern - Regular Semester */}
            {semesterType === "regular" && (
              <FormField
                control={form.control}
                name="dayPattern"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Days Pattern</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2"
                      >
                        {dayPatterns.map((pattern) => (
                          <div key={pattern.value} className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-muted">
                            <RadioGroupItem value={pattern.value} id={pattern.value} />
                            <Label htmlFor={pattern.value} className="flex flex-col cursor-pointer">
                              <span className="font-medium">{pattern.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {pattern.days.join(", ")}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Summer Format - Summer Semester */}
            {semesterType === "summer" && (
              <FormField
                control={form.control}
                name="summerFormat"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Summer Format</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-4"
                      >
                        {summerFormats.map((format) => (
                          <div key={format.value} className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-muted">
                            <RadioGroupItem value={format.value} id={format.value} />
                            <Label htmlFor={format.value} className="cursor-pointer">
                              {format.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Preferred Time - Show if petition */}
            {watchIsPetition && (
              <FormField
                control={form.control}
                name="preferredTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select preferred time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Time Slots</SelectLabel>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              <div className="flex items-center">
                                {slot.icon}
                                <span>{slot.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Flexibility Options - Show if petition */}
            {watchIsPetition && (
              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="flexibleTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Flexible with time</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="flexibleDays"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Flexible with days</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Petition Reason - Show if petition */}
        {watchIsPetition && (
          <Card>
            <CardHeader>
              <CardTitle>Petition Reason</CardTitle>
              <CardDescription>Explain why you need this section</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Petition</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain why you need this specific section..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How others can reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Anonymous Option */}
            <FormField
              control={form.control}
              name="isAnonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Keep my request anonymous</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Full Name - Only show if not anonymous */}
            {!form.watch("isAnonymous") && (
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Telegram Username */}
            <FormField
              control={form.control}
              name="telegramUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telegram Username (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="@username" {...field} />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    For direct communication when a match is found.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="your.email@example.com" 
                      {...field}
                      defaultValue={user?.email || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information about your request..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full bg-campus-purple hover:bg-campus-darkPurple"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Request'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SwapForm;
