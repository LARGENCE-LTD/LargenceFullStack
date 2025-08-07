"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/user/context";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useChatStore } from "@/stores/chatStore";

export default function ChatTestPage() {
  const { state: userState } = useUser();
  const { messages, addMessage, setError, setWarning } = useChatStore();
  const [testMessage, setTestMessage] = useState("");
  const [connectionLog, setConnectionLog] = useState<string[]>([]);

  const {
    connectionStatus,
    sessionId,
    connect,
    disconnect,
    sendMessage,
    isConnected,
  } = useWebSocket({
    onMessage: (message) => {
      console.log("Test page received message:", message);
      addMessage({
        role: 'ai',
        content: `Received: ${message.type} - ${message.message || message.question?.text || 'No content'}`,
        type: message.type === 'error' ? 'error' : message.type === 'warning' ? 'warning' : 'question',
      });
    },
    onConnect: (sessionId) => {
      console.log("Test page connected:", sessionId);
      setConnectionLog(prev => [...prev, `Connected: ${sessionId}`]);
    },
    onDisconnect: () => {
      console.log("Test page disconnected");
      setConnectionLog(prev => [...prev, "Disconnected"]);
    },
    onError: (error) => {
      console.error("Test page error:", error);
      setError(error);
      setConnectionLog(prev => [...prev, `Error: ${error}`]);
    },
    onReconnect: (attempt) => {
      console.log("Test page reconnecting:", attempt);
      setConnectionLog(prev => [...prev, `Reconnecting attempt ${attempt}`]);
    },
  });

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect:", error);
      setError(error instanceof Error ? error.message : "Connection failed");
    }
  };

  const handleSendTestMessage = () => {
    if (!testMessage.trim()) return;
    
    try {
      sendMessage(testMessage);
      addMessage({
        role: 'user',
        content: testMessage,
        type: 'answer',
      });
      setTestMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      setError(error instanceof Error ? error.message : "Send failed");
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const clearLogs = () => {
    setConnectionLog([]);
    useChatStore.getState().clearMessages();
  };

  if (!userState.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to test the WebSocket connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">WebSocket Chat Test</h1>
        
        {/* Connection Status */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="font-medium">Status:</span>{" "}
              <span className={`px-2 py-1 rounded text-sm ${
                connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
                connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {connectionStatus}
              </span>
            </div>
            <div>
              <span className="font-medium">Session ID:</span>{" "}
              <span className="font-mono text-sm">{sessionId || 'None'}</span>
            </div>
            <div>
              <span className="font-medium">Connected:</span>{" "}
              <span className={isConnected() ? 'text-green-600' : 'text-red-600'}>
                {isConnected() ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleConnect}
              disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Connect
            </button>
            <button
              onClick={handleDisconnect}
              disabled={!isConnected()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Disconnect
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Test Message Input */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Send Test Message</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter test message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSendTestMessage()}
            />
            <button
              onClick={handleSendTestMessage}
              disabled={!testMessage.trim() || !isConnected()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>

        {/* Connection Log */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Connection Log</h2>
          <div className="bg-gray-100 rounded p-4 h-32 overflow-y-auto">
            {connectionLog.length === 0 ? (
              <p className="text-gray-500">No connection events yet...</p>
            ) : (
              <div className="space-y-1">
                {connectionLog.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {new Date().toLocaleTimeString()}: {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Messages ({messages.length})</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet...</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-100 ml-8'
                      : message.type === 'error'
                      ? 'bg-red-100'
                      : message.type === 'warning'
                      ? 'bg-yellow-100'
                      : 'bg-gray-100 mr-8'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {message.role === 'user' ? 'You' : 'AI'} 
                        {message.type && ` (${message.type})`}
                      </div>
                      <div className="text-sm mt-1">{message.content}</div>
                    </div>
                    <div className="text-xs text-gray-500 ml-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 