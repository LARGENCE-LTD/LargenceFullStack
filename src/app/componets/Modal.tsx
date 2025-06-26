import React from "react";

// Interface for Modal props
interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string; // For custom modal content styling
  backdropClassName?: string; // For custom backdrop styling
}

// Modal component
export function Modal({
  open,
  onClose,
  children,
  className = "",
  backdropClassName = "bg-black/50 backdrop-blur-sm",
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 ${backdropClassName}`}
      role="dialog"
      aria-modal="true"
      onClick={onClose} // Close modal when clicking outside
    >
      <div
        className={`flex items-center justify-center min-h-screen p-4 ${className}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="bg-white rounded-xl shadow-lg p-1 sm:p-4 relative w-full max-w-md">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Close modal"
          >
            ×
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
