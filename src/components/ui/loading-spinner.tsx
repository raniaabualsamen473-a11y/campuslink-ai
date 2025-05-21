
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner = ({ size = "md" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-glow-pulse rounded-full border-2 border-campus-purple ${sizeClasses[size]}`}></div>
    </div>
  );
};
