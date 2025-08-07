const WebSocket = require('ws');

// Test configuration
const WS_URL = 'ws://localhost:8080/chat';
const TEST_TOKEN = 'test-jwt-token';
const TEST_TEMPLATE_ID = 'test-template-id';

console.log('Testing WebSocket server connection...');

// Create WebSocket connection
const ws = new WebSocket(`${WS_URL}?token=${TEST_TOKEN}&templateId=${TEST_TEMPLATE_ID}`);

ws.on('open', () => {
  console.log('WebSocket connection opened');
  
  // Send a test message after a short delay
  setTimeout(() => {
    const testMessage = {
      type: 'user_message',
      content: 'This is a test message'
    };
    
    console.log('Sending test message:', testMessage);
    ws.send(JSON.stringify(testMessage));
  }, 1000);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('📥 Received message:', message);
    
    // If we get a session_complete message, close the connection
    if (message.type === 'session_complete') {
      console.log('Session completed successfully');
      ws.close();
    }
  } catch (error) {
    console.error('Failed to parse message:', error);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error.message);
});

ws.on('close', (code, reason) => {
  console.log(`WebSocket closed with code ${code}: ${reason}`);
  process.exit(0);
});

// Test health endpoint
const http = require('http');

const healthCheck = () => {
  const req = http.request('http://localhost:8080/health', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const health = JSON.parse(data);
        console.log('Health check response:', health);
      } catch (error) {
        console.error('Failed to parse health response:', error);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Health check failed:', error.message);
  });
  
  req.end();
};

// Run health check after a delay
setTimeout(healthCheck, 500);

// Auto-close after 10 seconds
setTimeout(() => {
  console.log('Test timeout reached, closing connection');
  ws.close();
  process.exit(0);
}, 10000); 