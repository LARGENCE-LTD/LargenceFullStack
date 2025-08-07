import { useEffect, useRef, useCallback } from 'react';
import { DocAPI } from '@/contexts/document/docAPI';

export interface UseWebSocketOptions {
  onConnect?: (sessionId: string) => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { onConnect, onDisconnect, onError } = options;
  const isConnectedRef = useRef(false);

  const connect = useCallback(async (): Promise<string> => {
    try {
      const sessionId = await DocAPI.getWebSocketManager().connect();
      isConnectedRef.current = true;
      onConnect?.(sessionId);
      return sessionId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
      onError?.(errorMessage);
      throw error;
    }
  }, [onConnect, onError]);

  const disconnect = useCallback(() => {
    DocAPI.disconnect();
    isConnectedRef.current = false;
    onDisconnect?.();
  }, [onDisconnect]);

  const isConnected = useCallback(() => {
    return isConnectedRef.current && DocAPI.getWebSocketManager().isConnected();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected()) {
        disconnect();
      }
    };
  }, [disconnect, isConnected]);

  return {
    connect,
    disconnect,
    isConnected,
    getWebSocketManager: () => DocAPI.getWebSocketManager(),
  };
} 