import { ProvidedField } from "@/contexts/document/state";
import { API_BASE_URL } from "./constants";

// WebSocket message types matching the new server contract
export interface WebSocketMessage {
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

// WebSocket connection manager
class WebSocketManager {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private messageHandlers: Map<string, (data: WebSocketMessage) => void> = new Map();
  private connectionPromise: Promise<string> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelays = [1000, 3000, 5000, 10000, 15000];

  // Connect to WebSocket and get session ID
  async connect(token: string): Promise<string> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const url = `${API_BASE_URL}?token=${encodeURIComponent(token)}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log("Received WebSocket message:", data);
          this.handleMessage(data, resolve, reject);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
          reject(new Error("Invalid message format"));
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(new Error("WebSocket connection failed"));
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        this.cleanup();
        
        // Attempt reconnection if not an intentional close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.handleReconnect(token, resolve, reject);
        }
      };

      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          this.ws?.close();
          reject(new Error("Connection timeout"));
        }
      }, 10000);

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
      };
    });

    return this.connectionPromise;
  }

  private handleReconnect(token: string, resolve: (sessionId: string) => void, reject: (error: Error) => void) {
    const delay = this.reconnectDelays[this.reconnectAttempts] || this.reconnectDelays[this.reconnectDelays.length - 1];
    
    console.log(`Reconnection attempt ${this.reconnectAttempts + 1} in ${delay}ms`);
    
    setTimeout(async () => {
      try {
        this.reconnectAttempts++;
        this.connectionPromise = null; // Reset promise
        const sessionId = await this.connect(token);
        resolve(sessionId);
      } catch (error) {
        console.error("Reconnection failed:", error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.handleReconnect(token, resolve, reject);
        } else {
          reject(new Error("Max reconnection attempts reached"));
        }
      }
    }, delay);
  }

  private handleMessage(
    data: WebSocketMessage,
    resolve: (sessionId: string) => void,
    reject: (error: Error) => void
  ) {
    // Handle session ID from any message type
    if (data.sessionId && !this.sessionId) {
      this.sessionId = data.sessionId;
    }

    // Handle specific message types
    switch (data.type) {
      case 'session_resumed':
        console.log('Session resumed:', data.sessionId);
        if (data.sessionId) {
          resolve(data.sessionId);
        }
        break;

      case 'next_question':
        console.log('Next question received');
        if (data.sessionId && !this.sessionId) {
          resolve(data.sessionId);
        }
        break;

      case 'session_complete':
        console.log('Session completed, document ID:', data.documentId);
        if (data.sessionId) {
          resolve(data.sessionId);
        }
        // Intentional close after session completion
        this.ws?.close(1000, 'Session completed');
        break;

      case 'error':
        console.error('Server error:', data.message);
        reject(new Error(data.message || 'Server error'));
        break;

      case 'warning':
        console.warn('Server warning:', data.message);
        break;

      case 'guardrail_reprompt':
        console.log('Guardrail reprompt:', data.message);
        break;

      case 'guardrail_exit':
        console.log('Guardrail exit:', data.message);
        this.ws?.close(1000, 'Guardrail exit');
        break;
    }

    // Call registered message handlers
    const handler = this.messageHandlers.get(data.type);
    if (handler) {
      handler(data);
    }
  }

  // Register message handlers
  onMessage(type: string, handler: (data: WebSocketMessage) => void) {
    this.messageHandlers.set(type, handler);
  }

  // Send user message
  async sendUserMessage(content: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    const message: ClientMessage = {
      type: 'user_message',
      content: content,
    };

    console.log('Sending message:', message);
    this.ws.send(JSON.stringify(message));
  }

  // Close connection
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'User disconnect');
    }
    this.cleanup();
  }

  private cleanup() {
    this.ws = null;
    this.sessionId = null;
    this.connectionPromise = null;
    this.messageHandlers.clear();
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Global WebSocket manager instance
const wsManager = new WebSocketManager();

export const DocAPI = {
  // Start a new document generation session
  async startSession(token: string): Promise<{ sessionId: string }> {
    try {
      // Connect to WebSocket and get session ID
      const sessionId = await wsManager.connect(token);
      return { sessionId };
    } catch (error) {
      console.error("Failed to start session:", error);
      throw error;
    }
  },

  // Send user message to continue session
  async sendMessage(content: string): Promise<void> {
    try {
      await wsManager.sendUserMessage(content);
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  },

  // Listen for chat messages
  onMessage(
    type: 'session_resumed' | 'next_question' | 'session_complete' | 'error' | 'warning' | 'guardrail_reprompt' | 'guardrail_exit',
    handler: (data: WebSocketMessage) => void
  ): void {
    wsManager.onMessage(type, handler);
  },

  // Export final document in a specified format (PDF, Word, etc.)
  async exportDocument(documentId: string, format: string): Promise<Blob> {
    // This will be a separate HTTP endpoint for document export
    const baseUrl = API_BASE_URL.replace("ws://", "http://").replace("/chat", "");
    const response = await fetch(
      `${baseUrl}/documents/${documentId}/export?format=${format}`
    );
    if (!response.ok) throw new Error("Failed to export document");
    return await response.blob();
  },

  // Get the WebSocket manager for direct access if needed
  getWebSocketManager(): WebSocketManager {
    return wsManager;
  },

  // Disconnect WebSocket
  disconnect(): void {
    wsManager.disconnect();
  },
};
