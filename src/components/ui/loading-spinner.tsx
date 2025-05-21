
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "purple" | "white" | "blue";
}

export const LoadingSpinner = ({ size = "md", color = "purple" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };
  
  const colorClasses = {
    purple: "border-campus-purple",
    white: "border-white",
    blue: "border-blue-500",
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}></div>
    </div>
  );
};
