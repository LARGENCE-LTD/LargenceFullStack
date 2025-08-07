#!/bin/bash

# Largence WebSocket Server Deployment Script
set -e

echo "🚀 Starting WebSocket server deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "Node.js version: $(node -v)"

# Check if .env file exists
if [ ! -f .env ]; then
    echo ".env file not found. Please create one from env.example"
    exit 1
fi

echo "Environment configuration found"

# Install dependencies
echo "Installing dependencies..."
npm install

# Run linting
echo "Running linting..."
npm run lint

# Build the project
echo "Building project..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "Build failed - dist directory not found"
    exit 1
fi

echo "Build completed successfully"

# Test the build
echo "Testing build..."
node dist/index.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test health endpoint
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "Health check passed"
else
    echo "Health check failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Stop test server
kill $SERVER_PID 2>/dev/null || true

echo "All tests passed"

# Create deployment package
echo "Creating deployment package..."
DEPLOY_DIR="deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEPLOY_DIR

# Copy necessary files
cp -r dist $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp .env $DEPLOY_DIR/
cp README.md $DEPLOY_DIR/

# Create start script
cat > $DEPLOY_DIR/start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
node dist/index.js
EOF

chmod +x $DEPLOY_DIR/start.sh

# Create PM2 ecosystem file
cat > $DEPLOY_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'largence-websocket-server',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p $DEPLOY_DIR/logs

echo "Deployment package created: $DEPLOY_DIR"

# Display deployment instructions
echo ""
echo "Deployment package ready!"
echo ""
echo "To deploy:"
echo "1. Copy $DEPLOY_DIR to your server"
echo "2. Update .env with production values"
echo "3. Run: cd $DEPLOY_DIR && npm install --production"
echo "4. Start with PM2: pm2 start ecosystem.config.js"
echo ""
echo "Or start directly: cd $DEPLOY_DIR && ./start.sh"
echo ""
echo "Health check: curl http://localhost:8080/health"
echo "" 