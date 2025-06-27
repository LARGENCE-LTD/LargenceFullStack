import React from "react";
import { Button } from "./Button";

import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  backdropClassName?: string;
  contentClassName?: string;
  content_bg?: string;
}

export function Modal({
  open,
  onClose,
  children,
  className = "",
  backdropClassName = "bg-black/10 backdrop-blur-[2px]",
  contentClassName = "w-full max-w-md",
  content_bg = "bg-white",
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${backdropClassName}`}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`flex items-center justify-center min-h-screen w-full p-4 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`
            ${content_bg} rounded-xl shadow-lg relative
            ${contentClassName}
          `}
        >
          <Button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </Button>
          {children}
        </div>
      </div>
    </div>
  );
}
