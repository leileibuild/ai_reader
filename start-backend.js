/**
 * Backend Service Starter
 * 
 * This script runs the backend service, assuming MongoDB is already running.
 */
require('dotenv').config();
const { spawn } = require('child_process');

// Configuration
const APP_PORT = process.env.PORT || 3000;

/**
 * Start the backend Node.js application
 */
function startBackend() {
  console.log('Starting backend application...');
  
  // Start using nodemon for auto-restart during development
  const nodeProcess = spawn('npx', ['nodemon', 'server.js'], {
    stdio: 'inherit', // Show output in current console
    env: { ...process.env } // Pass environment variables
  });
  
  nodeProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
  });
  
  // Handle cleanup when the script is terminated
  process.on('SIGINT', () => {
    console.log('\nShutting down backend service...');
    
    // Kill backend process
    if (nodeProcess) {
      nodeProcess.kill();
    }
    
    process.exit(0);
  });
  
  console.log(`\nBackend service is ready!`);
  console.log(`API available at: http://localhost:${APP_PORT}`);
  console.log(`Health check: http://localhost:${APP_PORT}/api/health`);
  console.log('\nPress Ctrl+C to stop the backend service.');
}

// Start the backend
startBackend();
