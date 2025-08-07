"use client";

import { ChatMessage as ChatMessageType } from "@/stores/chatStore";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAI = message.role === 'ai';
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get message styling based on type
  const getMessageStyling = () => {
    const baseClasses = "max-w-3xl rounded-lg p-4";
    
    if (message.type === 'error') {
      return `${baseClasses} bg-red-50 border border-red-200 text-red-800`;
    }
    
    if (message.type === 'warning') {
      return `${baseClasses} bg-yellow-50 border border-yellow-200 text-yellow-800`;
    }
    
    if (isUser) {
      return `${baseClasses} bg-blue-600 text-white ml-auto`;
    }
    
    if (isAI) {
      return `${baseClasses} bg-white border border-gray-200 text-gray-900`;
    }
    
    return `${baseClasses} bg-gray-100 text-gray-900`;
  };

  // Get avatar/icon based on role and type
  const getAvatar = () => {
    if (isUser) {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    
    if (message.type === 'error') {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    
    if (message.type === 'warning') {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    
    // Default AI avatar
    return (
      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  };

  // Get message label
  const getMessageLabel = () => {
    if (isUser) return "You";
    if (message.type === 'error') return "Error";
    if (message.type === 'warning') return "Warning";
    if (message.type === 'question') return "AI Assistant";
    return "AI Assistant";
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} space-x-3`}>
      {!isUser && getAvatar()}
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`${getMessageStyling()} ${isUser ? 'order-2' : 'order-1'}`}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
        
        <div className={`flex items-center space-x-2 mt-1 ${isUser ? 'order-1' : 'order-2'}`}>
          <span className="text-xs text-gray-500 font-medium">
            {getMessageLabel()}
          </span>
          <span className="text-xs text-gray-400">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
      
      {isUser && getAvatar()}
    </div>
  );
} 