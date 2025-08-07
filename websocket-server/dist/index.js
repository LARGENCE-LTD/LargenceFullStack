"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const websocketServer_1 = require("./websocketServer");
dotenv_1.default.config();
const requiredEnvVars = [
    'WEBSOCKET_PORT',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'AI_SERVICE_URL',
    'AI_SERVICE_API_KEY'
];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    console.error('Please check your .env file or environment configuration.');
    process.exit(1);
}
const port = parseInt(process.env.WEBSOCKET_PORT || '8080', 10);
if (isNaN(port) || port < 1 || port > 65535) {
    console.error('Invalid WEBSOCKET_PORT. Must be a number between 1 and 65535.');
    process.exit(1);
}
let server;
try {
    server = new websocketServer_1.WebSocketServerManager(port);
    console.log(`WebSocket server started successfully on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
}
catch (error) {
    console.error('Failed to start WebSocket server:', error);
    process.exit(1);
}
const gracefulShutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
    try {
        if (server) {
            await server.cleanup();
        }
        console.log('WebSocket server shutdown complete.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});
console.log('WebSocket server is ready to accept connections.');
console.log('Health check available at: http://localhost:' + port + '/health');
//# sourceMappingURL=index.js.map