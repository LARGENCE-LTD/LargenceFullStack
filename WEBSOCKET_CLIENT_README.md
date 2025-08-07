# WebSocket Client Implementation

This document describes the complete WebSocket client implementation for the real-time document generation chat system.

## Overview

The WebSocket client provides a robust, responsive, and resilient interface that connects to our WebSocket server, manages the real-time chat lifecycle, and provides a seamless user experience for document generation.

## Architecture

### Core Components

1. **WebSocket Hook (`useWebSocket`)**: The engine that manages WebSocket connections
2. **Chat Store (`useChatStore`)**: State management using Zustand
3. **Chat Interface Components**: UI components for the chat experience
4. **Updated DocAPI**: Legacy API updated to match new server contract

### File Structure

```
src/
├── hooks/
│   └── useWebSocket.ts              # Core WebSocket hook
├── stores/
│   └── chatStore.ts                 # Zustand chat state management
├── app/
│   └── chat/
│       ├── page.tsx                 # Main chat page
│       ├── test/
│       │   └── page.tsx             # Test page for debugging
│       └── components/
│           ├── ChatInterface.tsx    # Main chat interface
│           ├── ChatMessage.tsx      # Individual message component
│           ├── ChatInput.tsx        # Message input component
│           ├── TypingIndicator.tsx  # AI typing indicator
│           └── ConnectionStatus.tsx # Connection status display
└── contexts/document/
    └── docAPI.ts                    # Updated legacy API
```

## Features

### Implemented Features

1. **Real-time WebSocket Communication**
   - Automatic connection management
   - Message sending and receiving
   - Connection status tracking
   - Session management

2. **Robust Error Handling**
   - Connection timeouts
   - Automatic reconnection with exponential backoff
   - Error message display
   - Graceful degradation

3. **State Management**
   - Message history
   - Connection status
   - Session state
   - Loading states
   - Error and warning handling

4. **User Interface**
   - Modern chat interface
   - Message bubbles with proper styling
   - Typing indicators
   - Connection status display
   - Auto-scroll to new messages
   - Responsive design

5. **Message Types Support**
   - User messages
   - AI questions
   - Session resumption
   - Session completion
   - Error messages
   - Warning messages
   - Guardrail messages

6. **Authentication Integration**
   - JWT token handling
   - Automatic authentication checks
   - Redirect to login if not authenticated

### Server Protocol Support

The client implements the complete server protocol:

#### Client → Server Messages
```typescript
interface ClientMessage {
  type: 'user_message';
  content: string;
}
```

#### Server → Client Messages
```typescript
interface ServerMessage {
  type: 'session_resumed' | 'next_question' | 'session_complete' | 'error' | 'warning' | 'guardrail_reprompt' | 'guardrail_exit';
  sessionId?: string;
  history?: Array<{role: 'user' | 'ai'; content: string; timestamp?: string;}>;
  question?: {id: string; text: string;};
  documentId?: string;
  message?: string;
  answeredQuestionIds?: string[];
  remainingAttempts?: number;
}
```

## Usage

### Basic Usage

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';
import { useChatStore } from '@/stores/chatStore';

function MyComponent() {
  const { connect, sendMessage, connectionStatus } = useWebSocket({
    onMessage: (message) => {
      useChatStore.getState().handleServerMessage(message);
    },
    onConnect: (sessionId) => {
      console.log('Connected with session:', sessionId);
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    }
  });

  const { messages, addMessage } = useChatStore();

  const handleSendMessage = (content: string) => {
    // Add to local state
    addMessage({
      role: 'user',
      content,
      type: 'answer'
    });
    
    // Send to server
    sendMessage(content);
  };

  return (
    <div>
      <div>Status: {connectionStatus}</div>
      {messages.map(message => (
        <div key={message.id}>{message.content}</div>
      ))}
    </div>
  );
}
```

### Navigation

The chat interface is accessible via:
- **Main Chat**: `/chat` - Full chat interface
- **Test Page**: `/chat/test` - Debug and testing interface
- **Header Button**: "Chat" button in the main app header

## Configuration

### Environment Variables

Create a `.env.local` file with:

```bash
# WebSocket Server URL
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080/chat

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### WebSocket Configuration

The WebSocket client includes these configurable options:

```typescript
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/chat';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAYS = [1000, 3000, 5000, 10000, 15000]; // Exponential backoff
```

## Testing

### Test Page

Visit `/chat/test` for a comprehensive testing interface that includes:

- Connection status monitoring
- Manual connect/disconnect controls
- Message sending and receiving
- Connection log
- Message history display

### Manual Testing

1. **Start the WebSocket server** (from the `websocket-server` directory)
2. **Navigate to `/chat`** in the client application
3. **Send a message** to test the full flow
4. **Check the test page** at `/chat/test` for detailed debugging

## Error Handling

### Connection Errors

- **Connection Timeout**: 10-second timeout with automatic retry
- **Network Errors**: Automatic reconnection with exponential backoff
- **Authentication Errors**: Redirect to login page
- **Server Errors**: Display error messages to user

### Message Errors

- **Invalid JSON**: Graceful handling with error logging
- **Missing Fields**: Fallback to default values
- **Type Errors**: TypeScript compilation prevents most issues

## Performance Considerations

### Optimizations

1. **Message Batching**: Messages are processed individually for real-time feel
2. **Auto-scroll**: Efficient scroll-to-bottom implementation
3. **State Updates**: Minimal re-renders through Zustand optimization
4. **Connection Management**: Efficient connection lifecycle management

### Memory Management

- **Message History**: Stored in Zustand store (consider pagination for large histories)
- **WebSocket Cleanup**: Automatic cleanup on component unmount
- **Event Listeners**: Proper cleanup to prevent memory leaks

## Security

### Authentication

- **JWT Tokens**: Automatic token extraction from user context
- **Token Validation**: Server-side validation on WebSocket upgrade
- **Session Management**: Secure session handling

### Data Protection

- **Message Sanitization**: Client-side input validation
- **Error Handling**: No sensitive information in error messages
- **Connection Security**: WSS (WebSocket Secure) recommended for production

## Future Enhancements

### Planned Features

1. **Message Persistence**: Local storage for offline message caching
2. **File Attachments**: Support for document uploads
3. **Typing Indicators**: Real-time typing status
4. **Message Reactions**: Emoji reactions to messages
5. **Message Search**: Search through conversation history
6. **Export Conversations**: Export chat history to various formats

### Technical Improvements

1. **WebSocket Compression**: Implement message compression
2. **Connection Pooling**: Multiple connection support
3. **Offline Mode**: Queue messages when offline
4. **Performance Monitoring**: Add performance metrics
5. **Accessibility**: Improve keyboard navigation and screen reader support

## Troubleshooting

### Common Issues

1. **Connection Fails**
   - Check WebSocket server is running
   - Verify `NEXT_PUBLIC_WEBSOCKET_URL` is correct
   - Check authentication status

2. **Messages Not Sending**
   - Verify connection status
   - Check browser console for errors
   - Ensure user is authenticated

3. **Messages Not Receiving**
   - Check server logs
   - Verify message format
   - Test with the test page

### Debug Tools

- **Browser DevTools**: Network tab for WebSocket monitoring
- **Test Page**: `/chat/test` for detailed debugging
- **Console Logs**: Comprehensive logging throughout the system

## Dependencies

### Required Packages

```json
{
  "zustand": "^4.4.0",
  "lucide-react": "^0.294.0"
}
```

### Optional Packages

```json
{
  "react-hot-toast": "^2.4.1"  // For notifications
}
```

## Conclusion

The WebSocket client implementation provides a production-ready, feature-complete chat interface that seamlessly integrates with the WebSocket server. It includes robust error handling, automatic reconnection, comprehensive state management, and a modern user interface.

The implementation follows React best practices, uses TypeScript for type safety, and provides excellent developer experience with comprehensive testing tools and documentation. 