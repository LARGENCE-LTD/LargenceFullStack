"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ 
  value, 
  onChange, 
  onSend, 
  disabled = false, 
  placeholder = "Type your message here..." 
}: ChatInputProps) {
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  // Handle send
  const handleSend = () => {
    if (!value.trim() || disabled || isComposing) return;
    onSend(value);
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle composition events for IME input
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  return (
    <div className="flex items-end space-x-3">
      {/* Textarea */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
          style={{ minHeight: '44px', maxHeight: '120px' }}
          rows={1}
        />
        
        {/* Character count */}
        {value.length > 0 && (
          <div className="absolute bottom-1 right-2 text-xs text-gray-400">
            {value.length}/2000
          </div>
        )}
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!value.trim() || disabled || isComposing}
        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
          value.trim() && !disabled && !isComposing
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        title="Send message"
      >
        <Send className="w-4 h-4" />
      </button>

      {/* File attachment button (placeholder for future feature) */}
      <button
        disabled={disabled}
        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
          !disabled
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title="Attach file (coming soon)"
      >
        <Paperclip className="w-4 h-4" />
      </button>
    </div>
  );
} 