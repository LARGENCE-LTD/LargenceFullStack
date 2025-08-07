# Largence WebSocket Server

A secure, scalable WebSocket server for real-time document generation with Supabase authentication and AI service integration.

## Features

- **Secure Authentication**: JWT-based authentication using Supabase Auth
- **Session Management**: Automatic session resumption and state persistence
- **Real-time Communication**: WebSocket-based chat interface for document generation
- **AI Service Integration**: Seamless integration with external AI service
- **Connection Management**: "Last connection wins" policy for multiple connections
- **Error Handling**: Comprehensive error handling and graceful degradation
- **Health Monitoring**: Built-in health check endpoint
- **Row Level Security**: Database-level security with Supabase RLS policies

## Architecture

The WebSocket server implements a decoupled service architecture:

- **Client (Web App)**: Manages WebSocket lifecycle and UI rendering
- **WebSocket Server**: Handles authentication, session management, and message routing
- **AI Service**: External service containing RAG and LLM logic
- **Supabase**: PostgreSQL database with Row Level Security

## Prerequisites

- Node.js 18+ 
- Supabase project with PostgreSQL database
- AI service endpoint (as defined in the API contract)

## Installation

1. **Clone and install dependencies:**
   ```bash
   cd websocket-server
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   WEBSOCKET_PORT=8080
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   AI_SERVICE_URL=http://localhost:3001
   AI_SERVICE_API_KEY=your_ai_service_api_key
   NODE_ENV=development
   ```

3. **Set up database schema:**
   - Run the SQL script in `database/schema.sql` in your Supabase SQL editor
   - This creates the required tables and RLS policies

## Database Schema

### Tables

- **`document_templates`**: Predefined document templates with question sets
- **`chat_sessions`**: Active chat sessions with conversation history
- **`generated_documents`**: Final generated documents

### Row Level Security

All tables have RLS enabled with policies ensuring users can only access their own data.

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Health Check

```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "healthy",
  "connections": {
    "total": 5,
    "active": 3
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## WebSocket Connection

### Connection URL Format

```
wss://your-api.com/chat?token=SUPABASE_JWT&templateId=TEMPLATE_UUID
```

### Authentication Flow

1. Client connects with Supabase JWT and template ID
2. Server validates JWT using Supabase service role
3. Server validates template exists
4. Connection is established with user and template context

### Message Types

#### Client Messages

```typescript
{
  type: 'user_message',
  content: 'User response to question'
}
```

#### Server Messages

**Session Resumed:**
```typescript
{
  type: 'session_resumed',
  sessionId: 'uuid',
  history: [/* conversation history */]
}
```

**Next Question:**
```typescript
{
  type: 'next_question',
  sessionId: 'uuid',
  question: {
    id: 'question_id',
    text: 'What is the next question?'
  }
}
```

**Session Complete:**
```typescript
{
  type: 'session_complete',
  sessionId: 'uuid',
  documentId: 'generated_document_uuid'
}
```

**Error:**
```typescript
{
  type: 'error',
  message: 'Error description'
}
```

## Session Management

### New Sessions

1. User connects with valid JWT and template ID
2. Server creates new chat session
3. Server sends first question immediately
4. Conversation continues until completion

### Session Resumption

1. User reconnects with same JWT and template ID
2. Server finds existing incomplete session
3. Server sends session history to client
4. User can continue from where they left off

### Session Completion

1. AI service determines all questions are answered
2. Server marks session as complete
3. Server sends completion message with document ID
4. Connection is closed gracefully

## AI Service Integration

### API Contract

**Endpoint:** `POST /v1/chat/next-question`

**Headers:**
```
Authorization: Bearer YOUR_AI_SERVICE_API_KEY
Content-Type: application/json
```

**Request:**
```json
{
  "sessionId": "chat-session-uuid"
}
```

**Response:**
```json
{
  "status": "in_progress",
  "nextQuestion": {
    "text": "What is the next question?"
  }
}
```

### Error Handling

- **5xx Errors**: AI service unavailable, sends retry message to client
- **4xx Errors**: Client errors, logged but don't terminate connection
- **Network Errors**: Connection timeout, sends retry message to client

## Security

### Authentication

- JWT validation using Supabase service role
- Template validation before connection establishment
- No connection possible without valid credentials

### Data Protection

- Row Level Security (RLS) on all database tables
- Users can only access their own sessions and documents
- Service-to-service authentication with API keys

### Connection Security

- WebSocket connections over WSS (secure)
- Automatic cleanup of abandoned sessions
- Rate limiting considerations (implement as needed)

## Monitoring

### Health Check

The `/health` endpoint provides:
- Server status
- Active connection count
- Timestamp

### Logging

The server logs:
- Connection events
- Authentication failures
- Session management
- AI service errors
- Connection statistics

## Maintenance

### Cleanup Script

Run the cleanup script daily to remove old sessions:

```sql
-- In Supabase Edge Function (cron: 0 0 * * *)
DELETE FROM public.chat_sessions 
WHERE is_complete = false 
AND updated_at < now() - interval '24 hours';
```

### Performance Considerations

- Connection pooling for database operations
- Efficient JSONB operations for conversation history
- Indexed queries for session lookups
- Graceful connection cleanup

## Error Handling

### Client Errors

- Malformed messages are ignored (not logged)
- Invalid message formats are ignored
- Connection errors trigger reconnection logic

### Server Errors

- Database errors are logged and retried
- AI service errors are communicated to client
- Authentication failures close connection immediately

### Recovery

- Session state is persisted after every message
- Reconnections restore exact conversation state
- Failed AI service calls can be retried

## Development

### TypeScript

The entire codebase is written in TypeScript with strict type checking.

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

## Deployment

### Environment Variables

Ensure all required environment variables are set in production:

- `WEBSOCKET_PORT`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AI_SERVICE_URL`
- `AI_SERVICE_API_KEY`
- `NODE_ENV=production`

### Process Management

Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start dist/index.js --name websocket-server
```

### Load Balancing

For high availability, deploy multiple instances behind a load balancer that supports WebSocket connections.

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check if server is running and port is accessible
2. **Authentication Failed**: Verify Supabase credentials and JWT validity
3. **Template Not Found**: Ensure template ID exists in database
4. **AI Service Unavailable**: Check AI service health and network connectivity

### Debug Mode

Set `NODE_ENV=development` for detailed logging.

### Health Check

Use the health endpoint to verify server status:

```bash
curl http://localhost:8080/health
```

## API Reference

### WebSocket Events

- `connection`: New WebSocket connection established
- `message`: Message received from client
- `close`: Connection closed
- `error`: Connection error

### Database Operations

- `validateToken()`: Validate Supabase JWT
- `validateTemplate()`: Check template exists
- `findExistingSession()`: Find incomplete session
- `createSession()`: Create new session
- `updateConversationHistory()`: Add message to history
- `markSessionComplete()`: Mark session as complete

### Connection Management

- `addConnection()`: Add new connection (closes existing)
- `removeConnection()`: Remove connection
- `sendToUser()`: Send message to specific user
- `getStats()`: Get connection statistics

## License

This project is part of the Largence platform. 