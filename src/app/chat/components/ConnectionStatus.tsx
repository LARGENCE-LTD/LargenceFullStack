"use client";

import { useChatStore } from "@/stores/chatStore";
import { ConnectionStatus as ConnectionStatusType } from "@/hooks/useWebSocket";

export default function ConnectionStatus() {
  const { connectionStatus } = useChatStore();

  const getStatusConfig = (status: ConnectionStatusType) => {
    switch (status) {
      case 'connected':
        return {
          text: 'Connected',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'connecting':
        return {
          text: 'Connecting...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ),
        };
      case 'reconnecting':
        return {
          text: 'Reconnecting...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ),
        };
      case 'error':
        return {
          text: 'Connection Error',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'disconnected':
      default:
        return {
          text: 'Disconnected',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 1.414L7.586 9H3a1 1 0 000 2h6a1 1 0 001-1V3a1 1 0 00-1-1H3zm10.293 10.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L14 15.414l-1.293 1.293a1 1 0 01-1.414-1.414L12.586 14l-1.293-1.293z" clipRule="evenodd" />
            </svg>
          ),
        };
    }
  };

  const config = getStatusConfig(connectionStatus);

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
      <span className="mr-2">{config.icon}</span>
      {config.text}
    </div>
  );
} 