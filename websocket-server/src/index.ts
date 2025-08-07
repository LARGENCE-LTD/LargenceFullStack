import dotenv from 'dotenv';
import { WebSocketServerManager } from './websocketServer';

// Load environment variables
dotenv.config();

// Set fallback values for development/testing when environment variables are not available
const env = {
  WEBSOCKET_PORT: process.env.WEBSOCKET_PORT || '8080',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:3001',
  AI_SERVICE_API_KEY: process.env.AI_SERVICE_API_KEY || 'placeholder_ai_service_key',
  EMBEDDING_API_KEY: process.env.EMBEDDING_API_KEY || 'placeholder_embedding_key',
  LLM_API_KEY: process.env.LLM_API_KEY || 'placeholder_llm_key',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// Apply fallback values to process.env
Object.entries(env).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
  }
});

// Log which variables are using fallbacks
const fallbackVars = Object.entries(env).filter(([key, value]) => 
  value.startsWith('placeholder_') || (key === 'AI_SERVICE_URL' && value === 'http://localhost:3001')
);

if (fallbackVars.length > 0) {
  console.warn('⚠️  Using fallback values for development/testing:');
  fallbackVars.forEach(([key, value]) => {
    console.warn(`   ${key}: ${value}`);
  });
  console.warn('   Set proper environment variables for production use.\n');
}

// Parse port
const port = parseInt(process.env.WEBSOCKET_PORT || '8080', 10);

if (isNaN(port) || port < 1 || port > 65535) {
  console.error('Invalid WEBSOCKET_PORT. Must be a number between 1 and 65535.');
  process.exit(1);
}

// Create and start the WebSocket server
let server: WebSocketServerManager;

try {
  server = new WebSocketServerManager(port);
  console.log(`WebSocket server started successfully on port ${port}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
} catch (error) {
  console.error('Failed to start WebSocket server:', error);
  process.exit(1);
}

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
  
  try {
    if (server) {
      await server.cleanup();
    }
    console.log('WebSocket server shutdown complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle various shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Log server startup
console.log('WebSocket server is ready to accept connections.');
console.log('Health check available at: http://localhost:' + port + '/health'); 