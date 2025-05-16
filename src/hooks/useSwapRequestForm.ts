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

export const useSwapRequestForm = ({
  user,
  editingRequestId,
  onRequestSubmitted,
  onCancelEdit
}: UseSwapRequestFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [requestType, setRequestType] = useState("swap");
  const [semester, setSemester] = useState("regular");
  
  // Form state
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

  useEffect(() => {
    // Check for telegram username in user metadata
    if (user) {
      const metadata = user.user_metadata;
      if (metadata && metadata.telegram_username) {
        setTelegramUsername(metadata.telegram_username);
      }
    }
    
    // Reset field values when semester or request type changes
    setCurrentDaysPattern(semester === "regular" ? "stt" : "everyday");
    setDesiredDaysPattern(semester === "regular" ? "stt" : "everyday");
    setCurrentStartTime("");
    setDesiredStartTime("");
  }, [user, semester, requestType]);

  // Load existing request data if editing
  useEffect(() => {
    if (editingRequestId) {
      loadRequestData(editingRequestId);
    }
  }, [editingRequestId]);

  const loadRequestData = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (error) throw error;
      
      if (data) {
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
      }
    } catch (error) {
      console.error("Error loading swap request:", error);
      toast.error("Failed to load request data");
    }
  };

  // Check if a duplicate request already exists
  const checkForDuplicate = async (
    userId: string, 
    courseName: string, 
    currentSectionData: {number: number, pattern: string, time: string} | null, 
    desiredSectionData: {number: number, pattern: string, time: string} | null
  ): Promise<boolean> => {
    try {
      // Query for existing requests with the same course and sections
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('desired_course', courseName);
      
      if (error) throw error;
      
      // For swap requests, check both sections match
      if (currentSectionData) {
        const duplicateSwap = data?.some(req => 
          req.current_section_number === currentSectionData.number && 
          req.current_days_pattern === currentSectionData.pattern &&
          req.current_start_time === currentSectionData.time &&
          req.desired_section_number === desiredSectionData?.number &&
          req.desired_days_pattern === desiredSectionData?.pattern &&
          req.desired_start_time === desiredSectionData?.time
        );
        
        if (duplicateSwap) return true;
      } else {
        // For petitions, just check the desired section
        const duplicatePetition = data?.some(req => 
          req.petition && 
          req.desired_section_number === desiredSectionData?.number &&
          req.desired_days_pattern === desiredSectionData?.pattern &&
          req.desired_start_time === desiredSectionData?.time
        );
        
        if (duplicatePetition) return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Error checking for duplicate requests:", error);
      return false; // Allow submission if check fails
    }
  };

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

  const handleSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit a request");
      return;
    }
    
    setIsLoading(true);
    
    // Get final values
    const finalCourseName = customCourseName || courseName;
    
    // Validate required fields
    if (!finalCourseName) {
      toast.error("Please select or enter a course name");
      setIsLoading(false);
      return;
    }
    
    // Validate section data
    if (requestType === "swap") {
      if (!currentSectionNumber || !currentStartTime) {
        toast.error("Please complete all current section fields");
        setIsLoading(false);
        return;
      }
    }
    
    if (!desiredSectionNumber || !desiredStartTime) {
      toast.error("Please complete all desired section fields");
      setIsLoading(false);
      return;
    }
    
    if (!telegramUsername) {
      toast.error("Please enter your Telegram username for contact");
      setIsLoading(false);
      return;
    }
    
    try {
      // Create string representation of sections for backwards compatibility
      const currentSectionString = requestType === "swap" 
        ? `Section ${currentSectionNumber} (${formatDaysPattern(currentDaysPattern, semester)} ${formatTime(currentStartTime)})`
        : null;
        
      const desiredSectionString = `Section ${desiredSectionNumber} (${formatDaysPattern(desiredDaysPattern, semester)} ${formatTime(desiredStartTime)})`;
      
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

      const requestData: SwapRequest = {
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
        current_section_number: currentSectionData?.number || null,
        current_days_pattern: currentSectionData?.pattern || null,
        current_start_time: currentSectionData?.time || null,
        
        desired_section_number: desiredSectionData.number,
        desired_days_pattern: desiredSectionData.pattern,
        desired_start_time: desiredSectionData.time,
        
        reason: requestType === "petition" ? reason : null,
        summer_format: semester === "summer" ? summerFormat : null,
        days_pattern: semester === "regular" ? (requestType === "petition" ? desiredDaysPattern : null) : null,
        preferred_time: requestType === "petition" ? desiredStartTime : null
      };

      // If editing, update existing request
      if (editingRequestId) {
        const { error } = await supabase
          .from('swap_requests')
          .update(requestData)
          .eq('id', editingRequestId);
          
        if (error) throw error;
        
        toast.success("Request updated successfully!");
      } 
      // Otherwise insert new request
      else {
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
            course: finalCourseName,
            currentSection: currentSectionString,
            targetSection: desiredSectionString
          });
        }
        
        // Add the course to our options if it's new
        if (customCourseName && !courses.includes(customCourseName)) {
          setCourses([...courses, customCourseName]);
        }
      }
      
      // Reset form
      resetForm();
      
      // Notify parent component to refresh data
      onRequestSubmitted();
      
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error(error.message || "Error submitting request");
    } finally {
      setIsLoading(false);
    }
  };

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
