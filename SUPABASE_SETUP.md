# Supabase Integration Setup Guide

## Overview
This guide will help you set up the Supabase integration for the Largence document wizard system.

## Prerequisites
1. A Supabase account and project
2. Node.js and npm installed
3. The Largence project cloned locally

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account or sign in
2. Create a new project
3. Note down your project URL and API keys

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase-schema.sql` into the editor
3. Run the SQL script to create the database tables and sample data

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# WebSocket Server Configuration
WEBSOCKET_SERVER_PORT=8000

# AI Service Configuration (for future integration)
AI_SERVICE_URL=http://localhost:3001
```

Replace the placeholder values with your actual Supabase credentials.

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Start the Services

### Terminal 1: Start WebSocket Server
```bash
npm run dev:websocket
```

### Terminal 2: Start Next.js App
```bash
npm run dev
```

## Step 6: Test the Integration

1. Open your browser to `http://localhost:3000`
2. Sign up for a new account using Supabase Auth
3. Try creating a document using the wizard interface

## Database Tables Created

### document_templates
- Stores predefined document templates with their questions
- Contains sample templates for NDA, Employment Contract, and Service Agreement

### wizard_sessions
- Tracks user progress through the document wizard
- Stores answer history and session state

### generated_documents
- Stores completed documents
- Links to the original template and user

## Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Supabase Auth handles authentication
- JWT tokens for WebSocket authentication

## Troubleshooting

### WebSocket Connection Issues
- Ensure the WebSocket server is running on port 8000
- Check that your Supabase credentials are correct
- Verify that the database schema has been created

### Authentication Issues
- Make sure Supabase Auth is enabled in your project
- Check that the environment variables are set correctly
- Verify that the user is properly signed in

### Database Issues
- Run the SQL schema again if tables are missing
- Check the Supabase dashboard for any error messages
- Verify that RLS policies are in place

## Next Steps

1. **AI Service Integration**: Implement the AI service for document generation
2. **Document Export**: Add PDF/Word export functionality
3. **User Management**: Add user profile management features
4. **Analytics**: Add usage tracking and analytics
5. **Payment Integration**: Add subscription and billing features

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Check the terminal output for server errors
3. Verify your Supabase configuration
4. Ensure all dependencies are installed correctly
