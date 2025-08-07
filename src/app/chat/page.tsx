"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user/context";
import { useChatStore } from "@/stores/chatStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Loading } from "@/app/components/Loading";
import ChatInterface from "@/app/chat/components/ChatInterface";
import ConnectionStatus from "@/app/chat/components/ConnectionStatus";

export default function ChatPage() {
  const router = useRouter();
  const { state: userState } = useUser();
  const { 
    connectionStatus, 
    sessionId, 
    setConnectionStatus 
  } = useChatStore();

  const {
    connectionStatus: wsConnectionStatus,
    sessionId: wsSessionId,
    connect: wsConnect,
    disconnect: wsDisconnect,
    sendMessage: wsSendMessage,
  } = useWebSocket({
    onMessage: (message) => {
      useChatStore.getState().handleServerMessage(message);
    },
    onConnect: (sessionId) => {
      useChatStore.getState().setSessionId(sessionId);
      useChatStore.getState().setSession({
        id: sessionId,
        isActive: true,
        isComplete: false,
        startedAt: new Date().toISOString(),
      });
    },
    onDisconnect: () => {
      useChatStore.getState().setConnectionStatus('disconnected');
    },
    onError: (error) => {
      useChatStore.getState().setError(error);
    },
    onReconnect: (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
    },
  });

  // Sync WebSocket connection status with chat store
  useEffect(() => {
    setConnectionStatus(wsConnectionStatus);
  }, [wsConnectionStatus, setConnectionStatus]);

  // Sync session ID
  useEffect(() => {
    if (wsSessionId && !sessionId) {
      useChatStore.getState().setSessionId(wsSessionId);
    }
  }, [wsSessionId, sessionId]);

  // Check authentication on mount
  useEffect(() => {
    if (!userState.isAuthenticated && !userState.loading) {
      router.push("/login");
    }
  }, [userState.isAuthenticated, userState.loading, router]);

  // Auto-connect when authenticated
  useEffect(() => {
    if (userState.isAuthenticated && connectionStatus === 'disconnected') {
      wsConnect().catch((error) => {
        console.error('Failed to connect:', error);
        useChatStore.getState().setError('Failed to connect to chat server');
      });
    }
  }, [userState.isAuthenticated, connectionStatus, wsConnect]);

  // Handle session completion - redirect to document editor
  useEffect(() => {
    const session = useChatStore.getState().session;
    if (session.isComplete && session.documentId) {
      router.push(`/editor/${session.documentId}`);
    }
  }, [router]);

  // Show loading while checking authentication
  if (userState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="large" text="Loading..." />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!userState.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with connection status */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Document Generation Chat
          </h1>
          <ConnectionStatus />
        </div>
      </div>

      {/* Main chat interface */}
      <div className="flex-1 flex flex-col">
        <ChatInterface 
          onSendMessage={wsSendMessage}
          onDisconnect={wsDisconnect}
        />
      </div>
    </div>
  );
} 