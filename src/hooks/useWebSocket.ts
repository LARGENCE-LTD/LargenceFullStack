import { useState, useRef, useCallback, useEffect } from 'react';
import { useUser } from '@/contexts/user/context';

// Server message types matching the WebSocket server contract
export interface ServerMessage {
  type: 'session_resumed' | 'next_question' | 'session_complete' | 'error' | 'warning' | 'guardrail_reprompt' | 'guardrail_exit';
  sessionId?: string;
  history?: Array<{
    role: 'user' | 'ai';
    content: string;
    timestamp?: string;
  }>;
  question?: {
    id: string;
    text: string;
  };
  documentId?: string;
  message?: string;
  answeredQuestionIds?: string[];
  remainingAttempts?: number;
}

// Client message types
export interface ClientMessage {
  type: 'user_message';
  content: string;
}

// Connection status types
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

// WebSocket configuration
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/chat';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAYS = [1000, 3000, 5000, 10000, 15000]; // Exponential backoff

export interface UseWebSocketOptions {
  onMessage?: (message: ServerMessage) => void;
  onConnect?: (sessionId: string) => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
  onReconnect?: (attempt: number) => void;
  autoReconnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    onReconnect,
    autoReconnect = true
  } = options;

  const { state: userState } = useUser();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isIntentionalCloseRef = useRef(false);

  // Get authentication token
  const getAuthToken = useCallback(() => {
    if (!userState.isAuthenticated || !userState.user) {
      throw new Error('User not authenticated');
    }
    return userState.user.access_token;
  }, [userState.isAuthenticated, userState.user]);

  // Create WebSocket connection
  const connect = useCallback(async (): Promise<string> => {
    if (connectionStatus === 'connecting' || connectionStatus === 'connected') {
      throw new Error('Already connected or connecting');
    }

    try {
      const token = getAuthToken();
      setConnectionStatus('connecting');

      return new Promise<string>((resolve, reject) => {
        const url = `${WEBSOCKET_URL}?token=${encodeURIComponent(token)}`;
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          setConnectionStatus('connected');
          reconnectAttemptRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const message: ServerMessage = JSON.parse(event.data);
            console.log('Received WebSocket message:', message);
            
            // Handle session ID from any message type
            if (message.sessionId && !sessionId) {
              setSessionId(message.sessionId);
              onConnect?.(message.sessionId);
            }

            // Handle specific message types
            switch (message.type) {
              case 'session_resumed':
                console.log('Session resumed:', message.sessionId);
                break;
              case 'next_question':
                console.log('Next question received');
                break;
              case 'session_complete':
                console.log('Session completed, document ID:', message.documentId);
                // Intentional close after session completion
                isIntentionalCloseRef.current = true;
                ws.close(1000, 'Session completed');
                break;
              case 'error':
              case 'warning':
                console.error('Server error/warning:', message.message);
                onError?.(message.message || 'Server error');
                break;
              case 'guardrail_reprompt':
                console.log('Guardrail reprompt:', message.message);
                break;
              case 'guardrail_exit':
                console.log('Guardrail exit:', message.message);
                isIntentionalCloseRef.current = true;
                ws.close(1000, 'Guardrail exit');
                break;
            }

            // Call the general message handler
            onMessage?.(message);

          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
            onError?.('Invalid message format');
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('error');
          onError?.('WebSocket connection failed');
          reject(new Error('WebSocket connection failed'));
        };

        ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          setConnectionStatus('disconnected');
          wsRef.current = null;

          if (!isIntentionalCloseRef.current && autoReconnect) {
            handleReconnect();
          }

          onDisconnect?.();
        };

        // Set a timeout for connection
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('WebSocket connected');
          setConnectionStatus('connected');
          reconnectAttemptRef.current = 0;
        };
      });
    } catch (error) {
      setConnectionStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      onError?.(errorMessage);
      throw error;
    }
  }, [connectionStatus, getAuthToken, sessionId, onConnect, onMessage, onError, onDisconnect, autoReconnect]);

  // Handle reconnection with exponential backoff
  const handleReconnect = useCallback(() => {
    if (reconnectAttemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.log('Max reconnection attempts reached');
      setConnectionStatus('error');
      onError?.('Max reconnection attempts reached');
      return;
    }

    const delay = RECONNECT_DELAYS[reconnectAttemptRef.current] || RECONNECT_DELAYS[RECONNECT_DELAYS.length - 1];
    
    setConnectionStatus('reconnecting');
    onReconnect?.(reconnectAttemptRef.current + 1);

    reconnectTimeoutRef.current = setTimeout(async () => {
      try {
        reconnectAttemptRef.current++;
        await connect();
      } catch (error) {
        console.error('Reconnection failed:', error);
        handleReconnect(); // Try again
      }
    }, delay);
  }, [connect, onError, onReconnect]);

  // Send message to WebSocket
  const sendMessage = useCallback((content: string): void => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const message: ClientMessage = {
      type: 'user_message',
      content
    };

    console.log('Sending message:', message);
    wsRef.current.send(JSON.stringify(message));
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    isIntentionalCloseRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }

    setConnectionStatus('disconnected');
    setSessionId(null);
    reconnectAttemptRef.current = 0;
  }, []);

  // Check if connected
  const isConnected = useCallback((): boolean => {
    return wsRef.current?.readyState === WebSocket.OPEN;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    connectionStatus,
    sessionId,
    isConnected,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    
    // Utilities
    getWebSocket: () => wsRef.current,
  };
} 