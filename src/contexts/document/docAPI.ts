import { ProvidedField } from "@/contexts/document/state";
import { API_BASE_URL } from "./constants";

// WebSocket message types for type safety
export interface WebSocketMessage {
  type?: string;
  connected?: boolean;
  id?: string;
  document_request?: boolean;
  messages?: string[];
  status?: string;
  message?: string;
  missing_info_request?: boolean;
  fields?: Array<{
    field: string;
    explanation: string;
    example: string;
  }>;
  missing_info_response?: boolean;
  user_declined?: boolean;
  provided_info?: Record<string, string>;
  streaming?: boolean;
  chunk?: string;
  response?: string;
}

// WebSocket connection manager
class WebSocketManager {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private connectionPromise: Promise<string> | null = null;

  // Connect to WebSocket and get session ID
  async connect(): Promise<string> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.ws = new WebSocket(API_BASE_URL);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
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

      this.ws.onclose = () => {
        console.log("WebSocket closed");
        this.cleanup();
      };
    });

    return this.connectionPromise;
  }

  private handleMessage(
    data: WebSocketMessage,
    resolve: (sessionId: string) => void,
    reject: (error: Error) => void
  ) {
    // Handle initial connection response
    if (data.connected && data.id) {
      this.sessionId = data.id;
      resolve(data.id);
      return;
    }

    // Handle other message types
    if (data.type) {
      const handler = this.messageHandlers.get(data.type);
      if (handler) {
        handler(data);
      }
    }

    // Handle specific message types
    if (data.status === "started") {
      const handler = this.messageHandlers.get("status_started");
      if (handler) handler(data);
    }

    if (data.missing_info_request) {
      const handler = this.messageHandlers.get("missing_info_request");
      if (handler) handler(data);
    }

    if (data.streaming) {
      const handler = this.messageHandlers.get("streaming");
      if (handler) handler(data);
    }

    if (data.status === "completed") {
      const handler = this.messageHandlers.get("completed");
      if (handler) handler(data);
    }

    if (data.status === "canceled") {
      const handler = this.messageHandlers.get("canceled");
      if (handler) handler(data);
    }
  }

  // Register message handlers
  onMessage(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler);
  }

  // Send document request
  async sendDocumentRequest(messages: string[]): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    const request: WebSocketMessage = {
      document_request: true,
      messages: messages,
    };

    this.ws.send(JSON.stringify(request));
  }

  // Send missing info response
  async sendMissingInfoResponse(
    userDeclined: boolean,
    providedInfo: Record<string, string> = {}
  ): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    const response: WebSocketMessage = {
      missing_info_response: true,
      user_declined: userDeclined,
      provided_info: providedInfo,
    };

    this.ws.send(JSON.stringify(response));
  }

  // Close connection
  disconnect() {
    if (this.ws) {
      this.ws.close();
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
  async startSession(
    prompt: string,
    documentType: string
  ): Promise<{ sessionId: string }> {
    try {
      // Connect to WebSocket and get session ID
      const sessionId = await wsManager.connect();

      // Send document request
      await wsManager.sendDocumentRequest([prompt]);

      return { sessionId };
    } catch (error) {
      console.error("Failed to start session:", error);
      throw error;
    }
  },

  // Submit missing data to continue session
  async submitMissingData(
    sessionId: string,
    providedData: ProvidedField[],
    userDeclined?: boolean
  ): Promise<any> {
    try {
      // Convert provided data to the format expected by the server
      const providedInfo: Record<string, string> = {};
      providedData.forEach(({ field, answer }) => {
        providedInfo[field] = answer;
      });

      // Send missing info response
      await wsManager.sendMissingInfoResponse(userDeclined!, providedInfo);

      return { success: true };
    } catch (error) {
      console.error("Failed to submit missing data:", error);
      throw error;
    }
  },

  // Stream document content
  async streamDocument(
    sessionId: string,
    onChunk: (chunk: string) => void,
    onComplete: (finalContent: string) => void,
    onProgress: (progress: { current: number; total: number }) => void,
    onError: (error: string) => void,
    onMissingInfo: (
      fields: Array<{ field: string; explanation: string; example: string }>,
      message: string
    ) => void
  ): Promise<void> {
    let finalContent = "";

    // Register message handlers
    wsManager.onMessage("status_started", (data) => {
      console.log("Document generation started:", data.message);
    });

    wsManager.onMessage("missing_info_request", (data) => {
      onMissingInfo(data.fields || [], data.message || "");
    });

    wsManager.onMessage("streaming", (data) => {
      if (data.chunk) {
        finalContent += data.chunk;
        onChunk(data.chunk);
      }
    });

    wsManager.onMessage("completed", (data) => {
      if (data.response) {
        finalContent = data.response;
      }
      onComplete(finalContent);
      wsManager.disconnect();
    });

    wsManager.onMessage("canceled", (data) => {
      onError(data.message || "Session canceled by user");
      wsManager.disconnect();
    });

    // Handle connection errors
    if (!wsManager.isConnected()) {
      onError("WebSocket connection lost");
      return;
    }
  },

  // Export final document in a specified format (PDF, Word, etc.)
  async exportDocument(documentId: string, format: string): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL.replace("ws://", "http://").replace(
        "/stream-document",
        ""
      )}/${documentId}/export?format=${format}`
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
