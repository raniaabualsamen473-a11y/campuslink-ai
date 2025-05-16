
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDaysPattern, formatTime, getClassDuration } from "@/utils/timeSlotUtils";

interface SectionFieldsProps {
  type: "current" | "desired";
  sectionNumber: string;
  daysPattern: string;
  startTime: string;
  timeSlots: string[];
  setNumber: (value: string) => void;
  setDaysPattern: (value: string) => void;
  setStartTime: (value: string) => void;
  semester: string;
}

export const SectionFields = ({
  type,
  sectionNumber,
  daysPattern,
  startTime,
  timeSlots,
  setNumber,
  setDaysPattern,
  setStartTime,
  semester
}: SectionFieldsProps) => {
  return (
    <div className="space-y-4 border p-4 rounded-md bg-gray-50">
      <h3 className="font-medium text-lg text-campus-darkPurple">
        {type === "current" ? "Current Section Details" : "Desired Section Details"}
      </h3>
      
      {/* Section Number */}
      <div className="space-y-2">
        <Label htmlFor={`${type}-section-number`} className="text-black">Section Number</Label>
        <Input 
          id={`${type}-section-number`} 
          type="number"
          min="1"
          placeholder="e.g., 1, 2, 3" 
          value={sectionNumber}
          onChange={(e) => setNumber(e.target.value)}
          className="w-full"
        />
      </div>
      
      {/* Days Pattern */}
      {renderDayPatternOptions(
        type, 
        daysPattern, 
        setDaysPattern,
        semester
      )}
      
      {/* Start Time */}
      <div className="space-y-2">
        <Label htmlFor={`${type}-start-time`} className="text-black">Start Time</Label>
        <Select
          value={startTime}
          onValueChange={setStartTime}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select start time" />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((time) => (
              <SelectItem key={`${type}-${time}`} value={time}>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{formatTime(time)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          Class duration: {getClassDuration(semester, daysPattern)}
        </p>
      </div>
      
      {/* Preview of section format */}
      <div className="mt-2 bg-gray-100 p-2 rounded text-sm">
        <p><strong>Preview:</strong> Section {sectionNumber || "#"} ({formatDaysPattern(daysPattern, semester)} {formatTime(startTime) || "time"})</p>
      </div>
    </div>
  );
};

/**
 * Helper function to render day pattern options
 */
const renderDayPatternOptions = (
  field: string, 
  value: string, 
  onChange: (value: string) => void,
  semester: string
) => {
  if (semester === "summer") {
    return (
      <div className="space-y-4">
        <Label className="text-sm font-medium text-black">Days Format</Label>
        <RadioGroup 
          value={value}
          onValueChange={onChange}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
            <RadioGroupItem value="everyday" id={`${field}-everyday`} />
            <Label htmlFor={`${field}-everyday`} className="cursor-pointer text-black">Every day (Sun-Thu)</Label>
          </div>
          <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
            <RadioGroupItem value="sunmon" id={`${field}-sunmon`} />
            <Label htmlFor={`${field}-sunmon`} className="cursor-pointer text-black">Sun & Mon</Label>
          </div>
          <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
            <RadioGroupItem value="tuethusat" id={`${field}-tuethusat`} />
            <Label htmlFor={`${field}-tuethusat`} className="cursor-pointer text-black">Tue/Wed/Thu</Label>
          </div>
        </RadioGroup>
      </div>
    );
  } else {
    return (
      <div className="space-y-2">
        <Label className="text-black">Days Pattern</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input 
              type="radio" 
              id={`${field}-mw`}
              name={`${field}-days`} 
              value="mw"
              checked={value === "mw"}
              onChange={() => onChange("mw")}
              className="text-campus-purple focus:ring-campus-purple" 
            />
            <Label htmlFor={`${field}-mw`} className="font-normal text-black">Monday/Wednesday (1.5 hour classes)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input 
              type="radio" 
              id={`${field}-stt`}
              name={`${field}-days`}
              value="stt"
              checked={value === "stt"}
              onChange={() => onChange("stt")}
              className="text-campus-purple focus:ring-campus-purple" 
            />
            <Label htmlFor={`${field}-stt`} className="font-normal text-black">Sunday/Tuesday/Thursday (1 hour classes)</Label>
          </div>
        </div>
      </div>
    );
  }
};
