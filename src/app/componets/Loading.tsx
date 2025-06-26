import React from "react";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  text?: string;
  className?: string;
  textClassName?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = "medium",
  text = "Loading...",
  className = "",
  textClassName = "",
}) => {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  };

  const textSizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-red-600 ${sizeClasses[size]}`}
      />
      {text && (
        <p className={`mt-4 text-gray-600 ${textSizes[size]} ${textClassName}`}>
          {text}
        </p>
      )}
    </div>
  );
}; 