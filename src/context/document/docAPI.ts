// You can use fetch or axios. Here we use fetch for simplicity.
const API_BASE_URL = "/api/documents";

export const DocAPI = {
  // Start a new document generation session
  async startSession(prompt: string, documentType: string) {
    const response = await fetch(`${API_BASE_URL}/start-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, documentType }),
    });
    if (!response.ok) throw new Error("Failed to start session");
    return await response.json(); // should include sessionId, etc.
  },

  // Submit missing data to continue session
  async submitMissingData(sessionId: string, providedData: any) {
    const response = await fetch(`${API_BASE_URL}/${sessionId}/missing-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providedData }),
    });
    if (!response.ok) throw new Error("Failed to submit missing data");
    return await response.json(); // should include { missingData } or progress
  },

  // Stream document content (SSE, WebSocket, or chunked HTTP)
  async streamDocument(
    sessionId: string,
    onChunk: (chunk: string) => void,
    onComplete: (finalContent: string) => void,
    onProgress: (progress: { current: number; total: number }) => void,
    onError: (error: string) => void
  ) {
    // Example: use EventSource for SSE (adjust if using WebSocket)
    const eventSource = new EventSource(`${API_BASE_URL}/${sessionId}/stream`);
    let finalContent = "";

    eventSource.onmessage = (event) => {
      // Assume server sends JSON with { type: "chunk" | "done" | "progress", ... }
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chunk") {
          finalContent += data.chunk;
          onChunk(data.chunk);
        } else if (data.type === "progress") {
          onProgress({ current: data.current, total: data.total });
        } else if (data.type === "done") {
          onComplete(finalContent);
          eventSource.close();
        }
      } catch (e) {
        // Ignore parse errors for now
      }
    };

    eventSource.onerror = () => {
      onError("Streaming connection lost.");
      eventSource.close();
    };
  },

  // Export final document in a specified format (PDF, Word, etc.)
  async exportDocument(documentId: string, format: string) {
    const response = await fetch(`${API_BASE_URL}/${documentId}/export?format=${format}`);
    if (!response.ok) throw new Error("Failed to export document");
    // You might want to return a blob or a download link
    return await response.blob();
  },
};
