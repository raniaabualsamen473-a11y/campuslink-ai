
import { useState, useEffect } from "react";
import { SwapRequest } from "@/types/swap";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateTimeSlots } from "@/utils/timeSlotUtils";
import { 
  validateSwapFormFields,
  checkForDuplicateRequest 
} from "@/utils/validationUtils";
import { 
  prepareRequestData,
  mapRequestDataToForm 
} from "@/utils/requestDataUtils";

interface UseSwapRequestFormProps {
  user: any;
  editingRequestId: string | null;
  onRequestSubmitted: () => void;
  onCancelEdit: () => void;
}

// Main hook function
export const useSwapRequestForm = ({
  user,
  editingRequestId,
  onRequestSubmitted,
  onCancelEdit
}: UseSwapRequestFormProps) => {
  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [requestType, setRequestType] = useState("swap");
  const [semester, setSemester] = useState("regular");
  
  const [courseName, setCourseName] = useState("");
  const [customCourseName, setCustomCourseName] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [reason, setReason] = useState("");
  
  // Structured section data
  const [currentSectionNumber, setCurrentSectionNumber] = useState<string>("");
  const [currentDaysPattern, setCurrentDaysPattern] = useState("stt");
  const [currentStartTime, setCurrentStartTime] = useState("");
  
  const [desiredSectionNumber, setDesiredSectionNumber] = useState<string>("");
  const [desiredDaysPattern, setDesiredDaysPattern] = useState("stt");
  const [desiredStartTime, setDesiredStartTime] = useState("");
  
  // Available time slots based on semester and days pattern
  const [currentTimeSlots, setCurrentTimeSlots] = useState<string[]>([]);
  const [desiredTimeSlots, setDesiredTimeSlots] = useState<string[]>([]);
  
  const [summerFormat, setSummerFormat] = useState("everyday");
  const [courses, setCourses] = useState([
    "Machine Learning",
    "Advanced Algorithms",
    "Data Structures",
    "Artificial Intelligence",
    "Web Development",
    "Database Systems",
    "Computer Networks",
  ]);

  // Update time slots when semester or days pattern changes
  useEffect(() => {
    setCurrentTimeSlots(generateTimeSlots(semester, currentDaysPattern));
    setDesiredTimeSlots(generateTimeSlots(semester, desiredDaysPattern));
    
    // Reset selected times when the available options change
    setCurrentStartTime("");
    setDesiredStartTime("");
  }, [semester, currentDaysPattern, desiredDaysPattern]);

  // Initialize user data and handle semester changes
  useEffect(() => {
    initializeUserData();
    resetFieldsOnSemesterOrTypeChange();
  }, [user, semester, requestType]);

  // Load editing data if available
  useEffect(() => {
    if (editingRequestId) {
      loadRequestData(editingRequestId);
    }
  }, [editingRequestId]);

  // Initialize user data from metadata
  const initializeUserData = () => {
    if (user) {
      const metadata = user.user_metadata;
      if (metadata && metadata.telegram_username) {
        setTelegramUsername(metadata.telegram_username);
      }
    }
  };

  // Reset fields when semester or request type changes
  const resetFieldsOnSemesterOrTypeChange = () => {
    setCurrentDaysPattern(semester === "regular" ? "stt" : "everyday");
    setDesiredDaysPattern(semester === "regular" ? "stt" : "everyday");
    setCurrentStartTime("");
    setDesiredStartTime("");
  };

  // Load existing request data
  const loadRequestData = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const formData = mapRequestDataToForm(data as SwapRequest);
        populateFormWithData(formData);
      }
    } catch (error) {
      console.error("Error loading swap request:", error);
      toast.error("Failed to load request data");
    }
  };

  // Populate form with data
  const populateFormWithData = (formData: ReturnType<typeof mapRequestDataToForm>) => {
    setCourseName(formData.courseName);
    setRequestType(formData.requestType);
    setIsAnonymous(formData.isAnonymous);
    setTelegramUsername(formData.telegramUsername);
    setSemester(formData.semester);
    setSummerFormat(formData.summerFormat);
    setReason(formData.reason);
    setCurrentSectionNumber(formData.currentSectionNumber);
    setCurrentDaysPattern(formData.currentDaysPattern);
    setCurrentStartTime(formData.currentStartTime);
    setDesiredSectionNumber(formData.desiredSectionNumber);
    setDesiredDaysPattern(formData.desiredDaysPattern);
    setDesiredStartTime(formData.desiredStartTime);
  };

  // Send notification to user
  const sendNotification = async (email: string, type: string, details: any) => {
    try {
      await supabase.functions.invoke("send-notification", {
        body: {
          type,
          email,
          name: user?.user_metadata?.full_name || "User",
          details
        }
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Create or update request in database
  const saveRequestToDatabase = async (requestData: SwapRequest): Promise<boolean> => {
    try {
      if (editingRequestId) {
        const { error } = await supabase
          .from('swap_requests')
          .update(requestData)
          .eq('id', editingRequestId);
          
        if (error) throw error;
        
        toast.success("Request updated successfully!");
      } else {
        const { error } = await supabase
          .from('swap_requests')
          .insert(requestData);
          
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        toast.success("Request submitted successfully!");
        
        // Send email notification
        if (user.email) {
          await sendNotification(user.email, "request_submitted", {
            course: requestData.desired_course,
            currentSection: requestData.current_section,
            targetSection: requestData.desired_section
          });
        }
        
        // Add the course to our options if it's new
        if (customCourseName && !courses.includes(customCourseName)) {
          setCourses([...courses, customCourseName]);
        }
      }
      
      return true;
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error(error.message || "Error submitting request");
      return false;
    }
  };

  // Form submission handler
  const handleSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit a request");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Validate form fields
      const isValid = validateSwapFormFields(
        requestType,
        courseName,
        customCourseName,
        currentSectionNumber,
        currentStartTime,
        desiredSectionNumber,
        desiredStartTime,
        telegramUsername
      );
      
      if (!isValid) {
        setIsLoading(false);
        return;
      }
      
      const finalCourseName = customCourseName || courseName;
      
      // Create structured section data for checking duplicates
      const currentSectionData = requestType === "swap" 
        ? {
            number: parseInt(currentSectionNumber), 
            pattern: currentDaysPattern, 
            time: currentStartTime
          }
        : null;
        
      const desiredSectionData = {
        number: parseInt(desiredSectionNumber),
        pattern: desiredDaysPattern,
        time: desiredStartTime
      };

      // Check for duplicate requests (only if not editing)
      if (!editingRequestId) {
        const isDuplicate = await checkForDuplicateRequest(
          user.id, 
          finalCourseName, 
          currentSectionData, 
          desiredSectionData
        );
        
        if (isDuplicate) {
          toast.error("You've already submitted this exact request", {
            description: "Please edit your existing request instead of creating a duplicate"
          });
          setIsLoading(false);
          return;
        }
      }

      // Prepare request data
      const requestData = prepareRequestData(
        editingRequestId,
        user.id,
        user.user_metadata,
        isAnonymous,
        requestType,
        finalCourseName,
        currentSectionNumber,
        currentDaysPattern,
        currentStartTime,
        desiredSectionNumber,
        desiredDaysPattern,
        desiredStartTime,
        reason,
        semester,
        summerFormat,
        telegramUsername
      );

      // Save to database
      const success = await saveRequestToDatabase(requestData);
      
      if (success) {
        // Reset form and notify parent component
        resetForm();
        onRequestSubmitted();
      }
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    if (editingRequestId) {
      onCancelEdit();
    }
    
    setCourseName("");
    setCustomCourseName("");
    setIsAnonymous(false);
    setRequestType("swap");
    setSemester("regular");
    setReason("");
    setSummerFormat("everyday");
    
    // Reset structured section data
    setCurrentSectionNumber("");
    setCurrentDaysPattern("stt");
    setCurrentStartTime("");
    setDesiredSectionNumber("");
    setDesiredDaysPattern("stt");
    setDesiredStartTime("");
  };

  // Handle semester change
  const handleSemesterChange = (value: string) => {
    setSemester(value);
    
    // Reset days pattern based on semester type
    if (value === "regular") {
      setCurrentDaysPattern("stt");
      setDesiredDaysPattern("stt");
    } else {
      setCurrentDaysPattern("everyday");
      setDesiredDaysPattern("everyday");
    }
    
    // Reset times since available options may change
    setCurrentStartTime("");
    setDesiredStartTime("");
  };

  return {
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
    setCourses,
    handleSwapSubmit,
    resetForm,
    handleSemesterChange
  };
};
