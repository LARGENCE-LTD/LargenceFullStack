"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import ChatMessage from "@/app/chat/components/ChatMessage";
import ChatInput from "@/app/chat/components/ChatInput";
import TypingIndicator from "@/app/chat/components/TypingIndicator";

interface ChatInterfaceProps {
  onSendMessage: (content: string) => void;
  onDisconnect: () => void;
}

export default function ChatInterface({ onSendMessage, onDisconnect }: ChatInterfaceProps) {
  const { messages, isLoading, isTyping, session, error, warning } = useChatStore();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending message
  const handleSendMessage = (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message to store
    useChatStore.getState().addMessage({
      role: 'user',
      content: content.trim(),
      type: 'answer',
    });

    // Send to WebSocket
    onSendMessage(content.trim());
    setInputValue("");
  };

  // Handle session completion
  const handleSessionComplete = () => {
    if (session.documentId) {
      // The page component will handle the redirect
      console.log('Session completed, document ready:', session.documentId);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg font-medium">Welcome to Document Generation Chat</p>
            <p className="text-sm mt-2">
              Describe the document you need, and I'll guide you through the process.
            </p>
          </div>
        )}

        {/* Display messages */}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}

        {/* Session completion message */}
        {session.isComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Document Generation Complete
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your document has been generated successfully!</p>
                  <button
                    onClick={handleSessionComplete}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    View Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning message */}
        {warning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{warning}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          disabled={isLoading || session.isComplete}
          placeholder={
            session.isComplete 
              ? "Session completed" 
              : "Type your message here..."
          }
        />
      </div>
    </div>
  );
} 