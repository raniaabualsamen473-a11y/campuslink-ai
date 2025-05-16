
import { useState, useEffect } from "react";
import { SwapRequest } from "@/types/swap";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { normalizeSection } from "@/utils/sectionUtils";
import { formatDaysPattern, formatTime, generateTimeSlots } from "@/utils/timeSlotUtils";

interface UseSwapRequestFormProps {
  user: any;
  editingRequestId: string | null;
  onRequestSubmitted: () => void;
  onCancelEdit: () => void;
}

interface SectionData {
  number: number;
  pattern: string;
  time: string;
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
        populateFormWithExistingData(data);
      }
    } catch (error) {
      console.error("Error loading swap request:", error);
      toast.error("Failed to load request data");
    }
  };

  // Populate form with existing data
  const populateFormWithExistingData = (data: SwapRequest) => {
    setCourseName(data.desired_course || "");
    setRequestType(data.petition ? "petition" : "swap");
    setIsAnonymous(data.anonymous || false);
    setTelegramUsername(data.telegram_username || "");
    setSemester(data.summer_format ? "summer" : "regular");
    setSummerFormat(data.summer_format || "everyday");
    setReason(data.reason || "");
    
    // Set structured section data
    if (data.current_section_number) {
      setCurrentSectionNumber(data.current_section_number.toString());
    }
    if (data.current_days_pattern) {
      setCurrentDaysPattern(data.current_days_pattern);
    }
    if (data.current_start_time) {
      setCurrentStartTime(data.current_start_time);
    }
    
    if (data.desired_section_number) {
      setDesiredSectionNumber(data.desired_section_number.toString());
    }
    if (data.desired_days_pattern) {
      setDesiredDaysPattern(data.desired_days_pattern);
    }
    if (data.desired_start_time) {
      setDesiredStartTime(data.desired_start_time);
    }
  };

  // Check for duplicate requests
  const checkForDuplicate = async (
    userId: string, 
    courseName: string, 
    currentSectionData: SectionData | null, 
    desiredSectionData: SectionData | null
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('desired_course', courseName);
      
      if (error) throw error;
      
      if (currentSectionData) {
        return checkForDuplicateSwap(data, currentSectionData, desiredSectionData);
      } else {
        return checkForDuplicatePetition(data, desiredSectionData);
      }
    } catch (error: any) {
      console.error("Error checking for duplicate requests:", error);
      return false; // Allow submission if check fails
    }
  };

  // Check for duplicate swap request
  const checkForDuplicateSwap = (
    existingRequests: any[], 
    currentSection: SectionData, 
    desiredSection: SectionData | null
  ): boolean => {
    return existingRequests?.some(req => 
      req.current_section_number === currentSection.number && 
      req.current_days_pattern === currentSection.pattern &&
      req.current_start_time === currentSection.time &&
      req.desired_section_number === desiredSection?.number &&
      req.desired_days_pattern === desiredSection?.pattern &&
      req.desired_start_time === desiredSection?.time
    ) || false;
  };

  // Check for duplicate petition
  const checkForDuplicatePetition = (
    existingRequests: any[], 
    desiredSection: SectionData | null
  ): boolean => {
    return existingRequests?.some(req => 
      req.petition && 
      req.desired_section_number === desiredSection?.number &&
      req.desired_days_pattern === desiredSection?.pattern &&
      req.desired_start_time === desiredSection?.time
    ) || false;
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

  // Validate form fields
  const validateFormFields = (): boolean => {
    const finalCourseName = customCourseName || courseName;
    
    if (!finalCourseName) {
      toast.error("Please select or enter a course name");
      return false;
    }
    
    if (requestType === "swap") {
      if (!currentSectionNumber || !currentStartTime) {
        toast.error("Please complete all current section fields");
        return false;
      }
    }
    
    if (!desiredSectionNumber || !desiredStartTime) {
      toast.error("Please complete all desired section fields");
      return false;
    }
    
    if (!telegramUsername) {
      toast.error("Please enter your Telegram username for contact");
      return false;
    }

    return true;
  };

  // Prepare request data object
  const prepareRequestData = (): SwapRequest | null => {
    const finalCourseName = customCourseName || courseName;
    
    // Create string representation of sections for backwards compatibility
    const currentSectionString = requestType === "swap" 
      ? `Section ${currentSectionNumber} (${formatDaysPattern(currentDaysPattern, semester)} ${formatTime(currentStartTime)})`
      : null;
      
    const desiredSectionString = `Section ${desiredSectionNumber} (${formatDaysPattern(desiredDaysPattern, semester)} ${formatTime(desiredStartTime)})`;
    
    return {
      id: editingRequestId || uuidv4(),
      user_id: user.id,
      anonymous: isAnonymous,
      petition: requestType === "petition",
      telegram_username: telegramUsername,
      desired_course: finalCourseName,
      current_section: currentSectionString,
      desired_section: desiredSectionString,
      normalized_current_section: currentSectionString ? normalizeSection(currentSectionString) : null,
      normalized_desired_section: normalizeSection(desiredSectionString),
      university_id: user.user_metadata?.university_id,
      full_name: isAnonymous ? null : user.user_metadata?.full_name,
      email: user.email,
      
      // Structured section data
      current_section_number: requestType === "swap" ? parseInt(currentSectionNumber) : null,
      current_days_pattern: requestType === "swap" ? currentDaysPattern : null,
      current_start_time: requestType === "swap" ? currentStartTime : null,
      
      desired_section_number: parseInt(desiredSectionNumber),
      desired_days_pattern: desiredDaysPattern,
      desired_start_time: desiredStartTime,
      
      reason: requestType === "petition" ? reason : null,
      summer_format: semester === "summer" ? summerFormat : null,
      days_pattern: semester === "regular" ? (requestType === "petition" ? desiredDaysPattern : null) : null,
      preferred_time: requestType === "petition" ? desiredStartTime : null
    };
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
        console.log("Submitting request data:", requestData);
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
      if (!validateFormFields()) {
        setIsLoading(false);
        return;
      }
      
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
        const finalCourseName = customCourseName || courseName;
        const isDuplicate = await checkForDuplicate(
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
      const requestData = prepareRequestData();
      
      if (!requestData) {
        setIsLoading(false);
        return;
      }

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
