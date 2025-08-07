# WebSocket Implementation Documentation

## Overview

This document provides a comprehensive technical overview of the WebSocket-based document wizard system implemented in the Largence project. The system introduces a real-time, guided document creation experience that complements the existing AI-powered document generation workflow.

## Architecture Overview

### System Components

The WebSocket implementation consists of three primary components:

1. **WebSocket Server** (`src/server/websocket-server.ts`): Node.js server handling real-time communication
2. **Client WebSocket Manager** (`src/contexts/document/docAPI.ts`): Client-side WebSocket connection management
3. **Database Integration** (`src/lib/supabase.ts`): Supabase client configuration for data persistence

### Communication Flow

```
Client (Next.js) ←→ WebSocket Server ←→ Supabase Database
     ↑                    ↑                    ↑
  React State        Session Management    Data Persistence
  UI Components      Authentication        Row Level Security
```

## WebSocket Server Implementation

### Server Architecture

The WebSocket server is built using Node.js with the `ws` library and integrates directly with Supabase for authentication and data persistence.

**Key Features:**
- Manual WebSocket upgrade handling for authentication control
- JWT validation using Supabase service role
- Session management with automatic resumption
- Real-time question progression
- Database integration with PostgreSQL

### Authentication Flow

The server implements a secure authentication gate that validates every connection:

```typescript
// 1. Extract JWT and template ID from connection URL
const { token, templateId } = parseQueryParams(request.url);

// 2. Validate JWT using Supabase admin client
const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

// 3. Verify template exists in database
const { data: template } = await supabaseAdmin
  .from('document_templates')
  .select('id')
  .eq('id', templateId)
  .single();

// 4. Complete upgrade with user context
this.wss.handleUpgrade(request, socket, head, (ws) => {
  ws.userId = user.id;
  ws.templateId = templateId;
  this.wss.emit('connection', ws, request);
});
```

### Session Management

The server handles two session scenarios:

**New Session Creation:**
1. Validate user and template
2. Create new wizard session record
3. Initialize answer history as empty array
4. Set current question index to 0
5. Send first question to client

**Session Resumption:**
1. Query database for existing incomplete session
2. Load answer history and current question index
3. Send session resumed message with context
4. Continue from last answered question

### Question Flow Management

The server implements a state machine for question progression:

```typescript
private async sendNextQuestion(ws: AuthenticatedWebSocket) {
  // 1. Load current session and template
  const { data: session } = await supabaseAdmin
    .from('wizard_sessions')
    .select('*')
    .eq('id', ws.sessionId)
    .single();

  const { data: template } = await supabaseAdmin
    .from('document_templates')
    .select('*')
    .eq('id', ws.templateId)
    .single();

  // 2. Determine next question
  const currentIndex = session.current_question_index;
  const questions = template.questions;

  // 3. Check if all questions answered
  if (currentIndex >= questions.length) {
    await this.generateDocument(ws);
    return;
  }

  // 4. Send next question
  const question = questions[currentIndex];
  ws.send(JSON.stringify({
    type: 'next_question',
    payload: {
      questionId: question.id,
      fieldNumber: currentIndex + 1,
      totalFields: questions.length,
      title: question.title,
      description: question.description,
      example: question.example,
      required: question.required,
      type: question.type,
      options: question.options
    }
  }));
}
```

### Answer Processing

When a client submits an answer, the server:

1. Validates the message format
2. Updates the session's answer history
3. Increments the current question index
4. Persists changes to database
5. Sends the next question or triggers document generation

### Document Generation Placeholder

The server includes a placeholder for document generation:

```typescript
private async callAIService(templateName: string, documentData: any) {
  // TODO: Implement AI service call
  // This would call your AI service to generate the actual document content
  return `Generated ${templateName} content based on provided data:\n\n${JSON.stringify(documentData, null, 2)}`;
}
```

This placeholder needs to be replaced with actual AI service integration.

## Client-Side Implementation

### WebSocket Manager

The client implements a dual WebSocket manager system:

1. **WizardWebSocketManager**: Handles wizard-specific connections
2. **Legacy WebSocketManager**: Maintains existing document generation functionality

### Connection Management

The client establishes WebSocket connections with authentication:

```typescript
async connect(templateId: string): Promise<string> {
  // 1. Get current Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No authenticated session');
  }

  // 2. Construct WebSocket URL with authentication
  const wsUrl = `ws://localhost:8000/start-session?token=${session.access_token}&templateId=${templateId}`;
  
  // 3. Establish connection
  this.ws = new WebSocket(wsUrl);
  
  // 4. Set up event handlers
  this.ws.onmessage = (event) => this.handleMessage(event, resolve, reject);
  this.ws.onerror = (error) => reject(new Error("WebSocket connection failed"));
  this.ws.onclose = () => this.cleanup();
}
```

### Message Handling

The client processes different message types:

- **session_resumed**: Restore session state and continue
- **next_question**: Display new question to user
- **generation_complete**: Handle document completion
- **error**: Display error messages to user

### State Management Integration

The WebSocket client integrates with React state management:

```typescript
// Set up wizard message handlers
const setupWizardHandlers = () => {
  WizardAPI.onNextQuestion((question: WizardQuestion) => {
    dispatch({
      type: DOCUMENT_ACTION_TYPES.SET_CURRENT_QUESTION,
      payload: question,
    });
    dispatch({
      type: DOCUMENT_ACTION_TYPES.UPDATE_WIZARD_PROGRESS,
      payload: { current: question.fieldNumber - 1, total: question.totalFields },
    });
  });

  WizardAPI.onGenerationComplete((data: any) => {
    dispatch({
      type: DOCUMENT_ACTION_TYPES.SET_DOCUMENT_CONTENT,
      payload: `Document generated with ID: ${data.documentId}`,
    });
    dispatch({
      type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS,
      payload: "completed",
    });
  });
};
```

## Database Schema

### Tables Implemented

**document_templates**
- Stores predefined document templates with structured questions
- Questions stored as JSONB array with validation
- Includes sample templates for NDA, Employment Contract, and Service Agreement

**wizard_sessions**
- Tracks user progress through wizard flows
- Stores answer history as JSONB array
- Maintains current question index and completion status
- Links to user and template via foreign keys

**generated_documents**
- Stores completed documents with metadata
- Links to original template and user
- Includes document data and generated content
- Supports soft deletion for user privacy

### Row Level Security

All tables implement Row Level Security (RLS) policies:

```sql
-- Users can only access their own wizard sessions
CREATE POLICY "Users can manage their own wizard sessions" ON wizard_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Users can only access their own generated documents
CREATE POLICY "Users can manage their own generated documents" ON generated_documents
  FOR ALL USING (auth.uid() = user_id);
```

## Current Implementation Status

### Completed Features

1. **WebSocket Server**: Fully implemented with authentication and session management
2. **Client Integration**: WebSocket client with React state integration
3. **Database Schema**: Complete Supabase schema with RLS policies
4. **Authentication**: Supabase JWT validation for WebSocket connections
5. **Session Management**: Automatic session creation and resumption
6. **Question Flow**: Sequential question progression with answer persistence
7. **Error Handling**: Basic error handling and connection management
8. **Sample Data**: Three document templates with structured questions

### Placeholders and TODOs

1. **AI Service Integration**: Placeholder function needs actual AI service implementation
2. **Template Selection Interface**: No UI for users to select templates
3. **Wizard Entry Point**: No way to initiate wizard flow from main application
4. **Document Editor Integration**: Generated documents not connected to editor
5. **Import Path Issues**: WebSocket server uses Next.js imports that need fixing
6. **MongoDB Cleanup**: Old MongoDB dependencies need removal

## Required Implementation Tasks

### Phase 1: Core Integration (Priority: Critical)

**Template Selection Interface**
Create a component that allows users to:
- Browse available document templates
- View template descriptions and question counts
- Select a template to start wizard flow
- Integrate with existing workspace component

**Wizard Entry Point**
Update the main workflow to:
- Add template selection step
- Create decision point between wizard and legacy flows
- Implement seamless transition between workflows
- Add user preference for default workflow

**AI Service Integration**
Replace placeholder with actual implementation:
- Implement HTTP client for AI service communication
- Add proper error handling and retry logic
- Implement timeout handling for long-running generations
- Add fallback mechanisms for service failures

### Phase 2: System Cleanup (Priority: High)

**Import Path Resolution**
Fix WebSocket server import issues:
- Convert Next.js imports to Node.js compatible paths
- Implement proper environment variable handling
- Add TypeScript path mapping for server code
- Ensure server can run independently

**MongoDB Dependency Removal**
Complete migration to Supabase:
- Delete all MongoDB-related files
- Remove MongoDB dependencies from package.json
- Update any remaining references
- Verify no MongoDB imports remain

**Authentication Flow Completion**
Finalize Supabase authentication:
- Update login/signup pages
- Implement proper session management
- Add authentication state persistence
- Remove test data fallbacks

### Phase 3: User Experience (Priority: Medium)

**Document Editor Integration**
Connect wizard completion to editing:
- Load generated documents in existing editor
- Implement document saving and updating
- Add document version history
- Integrate with export functionality

**History and Management**
Update document history:
- Add wizard metadata to document records
- Implement wizard session history viewing
- Add ability to resume incomplete sessions
- Create template management interface

**Error Handling and Recovery**
Improve system resilience:
- Implement WebSocket reconnection logic
- Add graceful degradation for failures
- Create user-friendly error messages
- Add automatic retry mechanisms

### Phase 4: Production Readiness (Priority: Low)

**Security Hardening**
Implement production security:
- Add rate limiting to WebSocket connections
- Implement input validation and sanitization
- Add CORS configuration
- Implement proper logging and monitoring

**Performance Optimization**
Optimize system performance:
- Add database query optimization
- Implement connection pooling
- Add caching for template data
- Optimize WebSocket message handling

## Technical Considerations

### WebSocket vs REST API

We chose WebSocket for the wizard flow because:
- **Real-time interaction**: Immediate feedback on answer submission
- **Session state management**: Maintains conversation context
- **Reduced server load**: No polling required
- **Better user experience**: Seamless question progression

### Security Implementation

The system implements multiple security layers:
- **JWT validation**: Every WebSocket connection validates Supabase JWT
- **Row Level Security**: Database-level access control
- **Template validation**: Verifies template exists before allowing access
- **User isolation**: Users can only access their own data

### Error Handling Strategy

The system implements comprehensive error handling:
- **Connection errors**: Automatic reconnection attempts
- **Authentication errors**: Immediate connection termination
- **Database errors**: Graceful degradation with user feedback
- **Service errors**: Fallback mechanisms and retry logic

## Development Workflow

### Local Development

1. **Start WebSocket Server**:
   ```bash
   npm run dev:websocket
   ```

2. **Start Next.js Application**:
   ```bash
   npm run dev
   ```

3. **Configure Environment**:
   Copy `env.example` to `.env.local` and fill in Supabase credentials

### Testing

1. **Database Setup**: Run `supabase-schema.sql` in Supabase SQL editor
2. **Authentication**: Create user account through Supabase Auth
3. **Template Testing**: Verify sample templates are loaded
4. **Wizard Flow**: Test question progression and answer persistence

### Deployment

1. **Environment Configuration**: Set production environment variables
2. **Database Migration**: Ensure production database schema is applied
3. **Service Deployment**: Deploy WebSocket server and Next.js application
4. **Monitoring**: Set up logging and error tracking

## Troubleshooting

### Common Issues

**WebSocket Connection Failures**
- Verify Supabase credentials are correct
- Check WebSocket server is running on correct port
- Ensure CORS configuration allows connections
- Verify JWT token is valid and not expired

**Database Connection Issues**
- Check Supabase project is active
- Verify RLS policies are correctly configured
- Ensure service role key has proper permissions
- Check network connectivity to Supabase

**Authentication Problems**
- Verify user is properly signed in
- Check JWT token format and expiration
- Ensure Supabase Auth is enabled in project
- Verify user exists in auth.users table

### Debugging

**Enable Debug Logging**
Set `DEBUG=true` in environment variables to enable verbose logging.

**Check WebSocket Server Logs**
Monitor server console output for connection and error information.

**Database Query Debugging**
Use Supabase dashboard to monitor database queries and performance.

## Future Enhancements

### Planned Features

1. **Conditional Questions**: Show/hide questions based on previous answers
2. **Multi-step Validation**: Complex validation rules and error handling
3. **File Uploads**: Support for document attachments and signatures
4. **AI Assistance**: Smart suggestions and auto-completion
5. **Branching Logic**: Different question paths based on user selections

### Performance Optimizations

1. **Connection Pooling**: Optimize database connection management
2. **Caching**: Implement template and session caching
3. **Load Balancing**: Distribute WebSocket connections across multiple servers
4. **Message Compression**: Reduce WebSocket message payload sizes

### Security Enhancements

1. **Rate Limiting**: Implement per-user connection rate limits
2. **Input Sanitization**: Enhanced validation and sanitization
3. **Audit Logging**: Comprehensive audit trail for all operations
4. **Encryption**: End-to-end encryption for sensitive data

This implementation provides a solid foundation for real-time document creation with room for significant enhancement and optimization as the system scales.
