
/**
 * Normalizes section names for consistent matching
 * 
 * Performs the following normalizations:
 * - Converts to lowercase
 * - Trims whitespace
 * - Removes "section" text
 * - Standardizes day patterns
 * - Removes extra spaces and special characters
 */
export const normalizeSection = (sectionName: string): string => {
  if (!sectionName) return '';
  
  // Convert to lowercase and trim
  let normalized = sectionName.toLowerCase().trim();
  
  // Remove "section" word if present
  normalized = normalized.replace(/\bsection\s*/gi, '');
  
  // Standardize common day patterns
  // MW, M/W, Monday/Wednesday, etc. -> mw
  if (/\b(m[on]*(day)?[\s\/]*w[ed]*(nesday)?)\b/i.test(normalized)) {
    normalized = normalized.replace(/\b(m[on]*(day)?[\s\/]*w[ed]*(nesday)?)\b/i, 'mw');
  }
  
  // STT, S/T/T, Sunday/Tuesday/Thursday, etc. -> stt
  if (/\b(s[un]*(day)?[\s\/]*t[ue]*(sday)?[\s\/]*th[ur]*(sday)?)\b/i.test(normalized)) {
    normalized = normalized.replace(/\b(s[un]*(day)?[\s\/]*t[ue]*(sday)?[\s\/]*th[ur]*(sday)?)\b/i, 'stt');
  }
  
  // Standardize time formats (8:00 AM, 8 AM, 8am -> 8am)
  normalized = normalized.replace(/(\d+)(:00)?\s*(am|pm)/i, '$1$3');
  
  // Remove parentheses and their contents
  normalized = normalized.replace(/\(.*?\)/g, '');
  
  // Remove extra spaces
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Remove special characters except alphanumeric, spaces
  normalized = normalized.replace(/[^\w\s]/g, '');
  
  // Final trim
  return normalized.trim();
};

/**
 * Tests if two section names match after normalization
 * 
 * This function is more lenient when comparing sections to increase match opportunities
 */
export const sectionsMatch = (section1: string, section2: string): boolean => {
  // Direct comparison of normalized sections
  if (normalizeSection(section1) === normalizeSection(section2)) {
    return true;
  }
  
  // Extract section numbers for partial matches
  const extractSectionNumber = (section: string): string | null => {
    const match = section.match(/\b([A-Za-z]?\d+[A-Za-z]?)\b/);
    return match ? match[1].toLowerCase() : null;
  };
  
  const sectionNum1 = extractSectionNumber(section1);
  const sectionNum2 = extractSectionNumber(section2);
  
  // If both sections have identifiable numbers and they match
  if (sectionNum1 && sectionNum2 && sectionNum1 === sectionNum2) {
    return true;
  }
  
  // Fallback to looser matching if exact match fails
  const norm1 = normalizeSection(section1);
  const norm2 = normalizeSection(section2);
  
  // Check if either normalized string contains the other
  if (norm1 && norm2 && (norm1.includes(norm2) || norm2.includes(norm1))) {
    return true;
  }
  
  return false;
};
