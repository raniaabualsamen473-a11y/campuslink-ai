
/**
 * Generate time slots based on semester type and day pattern
 * 
 * @param semesterType - 'regular' or 'summer'
 * @param dayPattern - 'stt', 'mw', 'everyday', etc.
 * @returns Array of formatted time strings (HH:MM)
 */
export const generateTimeSlots = (semesterType: string, dayPattern: string): string[] => {
  const timeSlots: string[] = [];
  let startHour = 8;
  let startMinute = 30;
  
  if (semesterType === "regular") {
    // STT classes are 1 hour long
    if (dayPattern === "stt") {
      for (let i = 0; i < 10; i++) {
        const formattedHour = startHour.toString().padStart(2, '0');
        const formattedMinute = startMinute.toString().padStart(2, '0');
        timeSlots.push(`${formattedHour}:${formattedMinute}`);
        
        // Add 1 hour
        startMinute += 60;
        if (startMinute >= 60) {
          startHour += Math.floor(startMinute / 60);
          startMinute %= 60;
        }
      }
    } 
    // MW classes are 1.5 hours long
    else if (dayPattern === "mw") {
      for (let i = 0; i < 7; i++) {
        const formattedHour = startHour.toString().padStart(2, '0');
        const formattedMinute = startMinute.toString().padStart(2, '0');
        timeSlots.push(`${formattedHour}:${formattedMinute}`);
        
        // Add 1.5 hours (90 minutes)
        startMinute += 90;
        if (startMinute >= 60) {
          startHour += Math.floor(startMinute / 60);
          startMinute %= 60;
        }
      }
    }
  } 
  // Summer classes are 1.25 hours long
  else if (semesterType === "summer") {
    for (let i = 0; i < 8; i++) {
      const formattedHour = startHour.toString().padStart(2, '0');
      const formattedMinute = startMinute.toString().padStart(2, '0');
      timeSlots.push(`${formattedHour}:${formattedMinute}`);
      
      // Add 1.25 hours (75 minutes)
      startMinute += 75;
      if (startMinute >= 60) {
        startHour += Math.floor(startMinute / 60);
        startMinute %= 60;
      }
    }
  }
  
  return timeSlots;
};

/**
 * Get class duration based on semester and days pattern
 */
export const getClassDuration = (semesterType: string, dayPattern: string): string => {
  if (semesterType === "regular") {
    return dayPattern === "mw" ? "1 hour 30 minutes" : "1 hour";
  } else {
    return "1 hour 15 minutes";
  }
};

/**
 * Format time for display (HH:MM to h:MM AM/PM)
 */
export const formatTime = (time: string): string => {
  if (!time) return "";
  
  try {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    
    return `${displayHour}:${minutes} ${period}`;
  } catch (e) {
    return time;
  }
};

/**
 * Format days pattern for display
 */
export const formatDaysPattern = (pattern: string, semesterType: string): string => {
  if (semesterType === "regular") {
    switch (pattern) {
      case "mw": return "Mon/Wed";
      case "stt": return "Sun/Tue/Thu";
      default: return pattern;
    }
  } else {
    switch (pattern) {
      case "everyday": return "Every day";
      case "sunmon": return "Sun & Mon";
      case "tuethusat": return "Tue/Wed/Thu";
      default: return pattern;
    }
  }
};
