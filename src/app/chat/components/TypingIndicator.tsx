"use client";

export default function TypingIndicator() {
  return (
    <div className="flex justify-start space-x-3">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      {/* Typing indicator */}
      <div className="flex flex-col">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-gray-500 font-medium">AI Assistant</span>
          <span className="text-xs text-gray-400">typing...</span>
        </div>
      </div>
    </div>
  );
} 