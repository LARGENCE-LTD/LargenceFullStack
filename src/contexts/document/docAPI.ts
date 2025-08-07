import { ProvidedField } from "@/contexts/document/state";
import { supabase } from "@/lib/supabase";

// New WebSocket message types for wizard flow
export interface WizardWebSocketMessage {
  type: 'session_resumed' | 'next_question' | 'generation_complete' | 'error';
  payload: any;
}

export interface UserAnswerMessage {
  type: 'submit_answer';
  payload: {
    questionId: string;
    answer: string;
  };
}

// Legacy WebSocket message types for backward compatibility
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

// Updated WebSocket manager for wizard flow
class WizardWebSocketManager {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private connectionPromise: Promise<string> | null = null;

  async connect(templateId: string): Promise<string> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          reject(new Error('No authenticated session'));
          return;
        }

        const wsUrl = `ws://localhost:8000/start-session?token=${session.access_token}&templateId=${templateId}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log("Wizard WebSocket connected");
        };

        this.ws.onmessage = (event) => {
          try {
            const data: WizardWebSocketMessage = JSON.parse(event.data);
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
      } catch (error) {
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private handleMessage(
    data: WizardWebSocketMessage,
    resolve: (sessionId: string) => void,
    reject: (error: Error) => void
  ) {
    if (data.type === 'session_resumed') {
      this.sessionId = data.payload.sessionId;
      resolve(data.payload.sessionId);
      return;
    }

    // Handle other message types
    if (data.type) {
      const handler = this.messageHandlers.get(data.type);
      if (handler) {
        handler(data.payload);
      }
    }
  }

  sendAnswer(questionId: string, answer: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    const message: UserAnswerMessage = {
      type: 'submit_answer',
      payload: { questionId, answer }
    };

    this.ws.send(JSON.stringify(message));
  }

  onMessage(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionPromise = null;
    this.sessionId = null;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Legacy WebSocket connection manager (for backward compatibility)
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
      this.ws = new WebSocket("ws://localhost:8000/stream-document");

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
  async sendMissingInfoResponse(userDeclined: boolean, providedInfo: Record<string, string>): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    const request: WebSocketMessage = {
      missing_info_response: true,
      user_declined: userDeclined,
      provided_info: providedInfo,
    };

    this.ws.send(JSON.stringify(request));
  }

  onMessage(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionPromise = null;
    this.sessionId = null;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private cleanup() {
    this.ws = null;
    this.connectionPromise = null;
    this.sessionId = null;
  }
}

// Global WebSocket manager instances
const wizardWsManager = new WizardWebSocketManager();
const legacyWsManager = new WebSocketManager();

// New Wizard API
export const WizardAPI = {
  // Start a new wizard session
  async startWizardSession(templateId: string): Promise<{ sessionId: string }> {
    try {
      const sessionId = await wizardWsManager.connect(templateId);
      return { sessionId };
    } catch (error) {
      console.error("Failed to start wizard session:", error);
      throw error;
    }
  },

  // Submit answer to current question
  submitAnswer(questionId: string, answer: string): void {
    wizardWsManager.sendAnswer(questionId, answer);
  },

  // Set up message handlers
  onNextQuestion(handler: (question: any) => void): void {
    wizardWsManager.onMessage('next_question', handler);
  },

  onSessionResumed(handler: (data: any) => void): void {
    wizardWsManager.onMessage('session_resumed', handler);
  },

  onGenerationComplete(handler: (data: any) => void): void {
    wizardWsManager.onMessage('generation_complete', handler);
  },

  onError(handler: (error: any) => void): void {
    wizardWsManager.onMessage('error', handler);
  },

  // Disconnect
  disconnect(): void {
    wizardWsManager.disconnect();
  },

  // Check connection status
  isConnected(): boolean {
    return wizardWsManager.isConnected();
  }
};

// Legacy DocAPI (for backward compatibility)
export const DocAPI = {
  // Start a new document generation session
  async startSession(
    prompt: string,
    documentType: string
  ): Promise<{ sessionId: string }> {
    try {
      // Connect to WebSocket and get session ID
      const sessionId = await legacyWsManager.connect();

      // Send document request
      await legacyWsManager.sendDocumentRequest([prompt]);

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
      await legacyWsManager.sendMissingInfoResponse(userDeclined!, providedInfo);

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
    legacyWsManager.onMessage("status_started", (data) => {
      console.log("Document generation started:", data.message);
    });

    legacyWsManager.onMessage("missing_info_request", (data) => {
      onMissingInfo(data.fields || [], data.message || "");
    });

    legacyWsManager.onMessage("streaming", (data) => {
      if (data.chunk) {
        finalContent += data.chunk;
        onChunk(data.chunk);
      }
    });

    legacyWsManager.onMessage("completed", (data) => {
      if (data.response) {
        finalContent = data.response;
      }
      onComplete(finalContent);
      legacyWsManager.disconnect();
    });

    legacyWsManager.onMessage("canceled", (data) => {
      onError(data.message || "Session canceled by user");
      legacyWsManager.disconnect();
    });

    // Handle connection errors
    if (!legacyWsManager.isConnected()) {
      onError("WebSocket connection lost");
      return;
    }
  },

  // Export final document in a specified format (PDF, Word, etc.)
  async exportDocument(documentId: string, format: string): Promise<Blob> {
    const response = await fetch(
      `http://localhost:8000/${documentId}/export?format=${format}`
    );
    if (!response.ok) throw new Error("Failed to export document");
    return await response.blob();
  },

  // Disconnect WebSocket
  disconnect(): void {
    legacyWsManager.disconnect();
  },

  // Get WebSocket manager for advanced usage
  getWebSocketManager(): WebSocketManager {
    return legacyWsManager;
  }
};
