
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const SwapForm = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCourse, setCustomCourse] = useState<string>("");
  const [customCurrentSection, setCustomCurrentSection] = useState<string>("");
  const [customTargetSection, setCustomTargetSection] = useState<string>("");
  const [showCustomCourseInput, setShowCustomCourseInput] = useState(false);
  const [showCustomCurrentSectionInput, setShowCustomCurrentSectionInput] = useState(false);
  const [showCustomTargetSectionInput, setShowCustomTargetSectionInput] = useState(false);

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
      notes: "",
    },
  });

  const watchIsPetition = form.watch("isPetition");
  const watchIsAnonymous = form.watch("isAnonymous");

  const handleSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to submit a swap request");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the data for submission
      const requestData = {
        desired_course: showCustomCourseInput ? customCourse : data.course,
        current_section: watchIsPetition ? null : (showCustomCurrentSectionInput ? customCurrentSection : data.currentSection),
        desired_section: showCustomTargetSectionInput ? customTargetSection : data.targetSection,
        petition: data.isPetition,
        anonymous: data.isAnonymous,
        full_name: data.isAnonymous ? null : data.fullName,
        telegram_username: data.telegramUsername || null,
        email: data.email || user.email,
        user_id: user.id,
        notes: data.notes || null,
      };

      // Submit to Supabase
      const { error } = await supabase
        .from('swap_requests')
        .insert([requestData]);

      if (error) {
        throw new Error(error.message);
      }

      // Send notification via edge function
      await supabase.functions.invoke("send-notification", {
        body: {
          type: "request_submitted",
          email: data.email || user.email,
          name: data.fullName || "User",
          details: {
            course: showCustomCourseInput ? customCourse : data.course,
            currentSection: watchIsPetition ? null : (showCustomCurrentSectionInput ? customCurrentSection : data.currentSection),
            targetSection: showCustomTargetSectionInput ? customTargetSection : data.targetSection,
            telegramUsername: data.telegramUsername
          }
        }
      });

      toast.success("Your request has been submitted successfully!");
      form.reset();
      setCustomCourse("");
      setCustomCurrentSection("");
      setCustomTargetSection("");
      setShowCustomCourseInput(false);
      setShowCustomCurrentSectionInput(false);
      setShowCustomTargetSectionInput(false);
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error(`Failed to submit request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Course Selection */}
        <div>
          <Label htmlFor="course" className="text-black">Course</Label>
          {showCustomCourseInput ? (
            <div className="mt-1">
              <Input
                id="customCourse"
                value={customCourse}
                onChange={(e) => setCustomCourse(e.target.value)}
                className="text-black"
                placeholder="Enter course name"
              />
              <Button 
                type="button" 
                variant="link" 
                onClick={() => setShowCustomCourseInput(false)}
                className="mt-1 p-0 h-auto text-sm text-campus-purple"
              >
                Use course list
              </Button>
            </div>
          ) : (
            <div className="mt-1">
              <Select
                onValueChange={(value) => form.setValue("course", value)}
                value={form.watch("course")}
              >
                <SelectTrigger className="w-full text-black">
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
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="link" 
                onClick={() => {
                  setShowCustomCourseInput(true);
                  form.setValue("course", "");
                }}
                className="mt-1 p-0 h-auto text-sm text-campus-purple"
              >
                Add a different course
              </Button>
            </div>
          )}
          {form.formState.errors.course && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.course.message}</p>
          )}
        </div>

        {/* Toggle between Swap and Petition */}
        <div className="flex items-center space-x-2">
          <Switch
            id="isPetition"
            checked={watchIsPetition}
            onCheckedChange={(checked) => form.setValue("isPetition", checked)}
          />
          <Label htmlFor="isPetition" className="text-black">This is a petition (no current section)</Label>
        </div>

        {/* Current Section - Only show if not petition */}
        {!watchIsPetition && (
          <div>
            <Label htmlFor="currentSection" className="text-black">Current Section</Label>
            {showCustomCurrentSectionInput ? (
              <div className="mt-1">
                <Input
                  id="customCurrentSection"
                  value={customCurrentSection}
                  onChange={(e) => setCustomCurrentSection(e.target.value)}
                  className="text-black"
                  placeholder="Enter your current section"
                />
                <Button 
                  type="button" 
                  variant="link" 
                  onClick={() => setShowCustomCurrentSectionInput(false)}
                  className="mt-1 p-0 h-auto text-sm text-campus-purple"
                >
                  Use section list
                </Button>
              </div>
            ) : (
              <div className="mt-1">
                <Select
                  onValueChange={(value) => form.setValue("currentSection", value)}
                  value={form.watch("currentSection")}
                >
                  <SelectTrigger className="w-full text-black">
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
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="link" 
                  onClick={() => {
                    setShowCustomCurrentSectionInput(true);
                    form.setValue("currentSection", "");
                  }}
                  className="mt-1 p-0 h-auto text-sm text-campus-purple"
                >
                  Add a different section
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Target Section */}
        <div>
          <Label htmlFor="targetSection" className="text-black">Target Section</Label>
          {showCustomTargetSectionInput ? (
            <div className="mt-1">
              <Input
                id="customTargetSection"
                value={customTargetSection}
                onChange={(e) => setCustomTargetSection(e.target.value)}
                className="text-black"
                placeholder="Enter target section"
              />
              <Button 
                type="button" 
                variant="link" 
                onClick={() => setShowCustomTargetSectionInput(false)}
                className="mt-1 p-0 h-auto text-sm text-campus-purple"
              >
                Use section list
              </Button>
            </div>
          ) : (
            <div className="mt-1">
              <Select
                onValueChange={(value) => form.setValue("targetSection", value)}
                value={form.watch("targetSection")}
              >
                <SelectTrigger className="w-full text-black">
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
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="link" 
                onClick={() => {
                  setShowCustomTargetSectionInput(true);
                  form.setValue("targetSection", "");
                }}
                className="mt-1 p-0 h-auto text-sm text-campus-purple"
              >
                Add a different section
              </Button>
            </div>
          )}
          {form.formState.errors.targetSection && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.targetSection.message}</p>
          )}
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isAnonymous"
            checked={watchIsAnonymous}
            onCheckedChange={(checked) => form.setValue("isAnonymous", checked === true)}
          />
          <Label htmlFor="isAnonymous" className="text-black">Keep my request anonymous</Label>
        </div>

        {/* Contact Information */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-black">Contact Information</h3>
          
          {!watchIsAnonymous && (
            <div>
              <Label htmlFor="fullName" className="text-black">Full Name</Label>
              <Input
                id="fullName"
                {...form.register("fullName")}
                className="mt-1 text-black"
                placeholder="Your full name"
              />
              {form.formState.errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.fullName.message}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="telegramUsername" className="text-black">Telegram Username (optional)</Label>
            <Input
              id="telegramUsername"
              {...form.register("telegramUsername")}
              className="mt-1 text-black"
              placeholder="@username"
            />
            <p className="text-sm text-gray-500 mt-1">For direct communication when a match is found.</p>
            {form.formState.errors.telegramUsername && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.telegramUsername.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-black">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              className="mt-1 text-black"
              placeholder="your.email@example.com"
              defaultValue={user?.email || ""}
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes" className="text-black">Additional Notes (optional)</Label>
          <Textarea
            id="notes"
            {...form.register("notes")}
            className="mt-1 text-black"
            placeholder="Any additional information about your request..."
          />
        </div>
      </div>

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
  );
};

export default SwapForm;
