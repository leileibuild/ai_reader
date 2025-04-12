/**
 * Development Startup Script
 * 
 * This script manages both MongoDB and the backend service startup.
 * It automates the development environment setup with a single command.
 */
require('dotenv').config();
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const MONGODB_PORT = 27017;
const DATA_DIR = path.join(__dirname, 'data', 'db');
const LOG_DIR = path.join(__dirname, 'logs');
const MONGODB_LOG = path.join(LOG_DIR, 'mongodb.log');
const APP_PORT = process.env.PORT || 3000;

// Create required directories
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Created MongoDB data directory: ${DATA_DIR}`);
}

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  console.log(`Created logs directory: ${LOG_DIR}`);
}

/**
 * Check if MongoDB is already running on the specified port
 */
function checkMongoDBRunning() {
  return new Promise((resolve) => {
    exec(`lsof -i :${MONGODB_PORT} | grep LISTEN`, (error, stdout) => {
      if (error || !stdout) {
        // MongoDB is not running
        console.log('MongoDB is not running. Starting it now...');
        resolve(false);
      } else {
        // MongoDB is already running
        console.log('MongoDB is already running.');
        resolve(true);
      }
    });
  });
}

/**
 * Start MongoDB as a child process
 */
function startMongoDB() {
  return new Promise((resolve, reject) => {
    console.log('Starting MongoDB...');
    
    // Create MongoDB data directory if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // Specify MongoDB command and options
    const mongodPath = '/Applications/mongodb-macos-aarch64-8.0.6/bin/mongod'; // Path to your MongoDB installation
    const mongoArgs = [
      `--dbpath=${DATA_DIR}`,
      '--bind_ip=127.0.0.1', // Bind only to localhost for security
      `--port=${MONGODB_PORT}`,
      '--logpath=' + MONGODB_LOG,
      '--logappend'
    ];
    
    // Start MongoDB process
    const mongoProcess = spawn(mongodPath, mongoArgs, { 
      detached: true, // Run in background
      stdio: 'ignore' // Don't pipe output to parent
    });
    
    // Disconnect the parent from the child
    mongoProcess.unref();
    
    // Wait a bit to ensure MongoDB has time to start
    setTimeout(() => {
      console.log(`MongoDB started with PID ${mongoProcess.pid}`);
      console.log(`MongoDB log: ${MONGODB_LOG}`);
      console.log(`MongoDB data: ${DATA_DIR}`);
      resolve(mongoProcess);
    }, 2000);
    
    // Check for immediate failures
    mongoProcess.on('error', (err) => {
      console.error('Failed to start MongoDB:', err);
      reject(err);
    });
    
    mongoProcess.on('exit', (code, signal) => {
      if (code !== null && code !== 0) {
        console.error(`MongoDB exited with code ${code}`);
        reject(new Error(`MongoDB exited with code ${code}`));
      }
    });
  });
}

/**
 * Start the backend Node.js application
 */
function startBackend() {
  return new Promise((resolve) => {
    console.log('Starting backend application...');
    
    // Start using nodemon for auto-restart during development
    const nodeProcess = spawn('npx', ['nodemon', 'server.js'], {
      stdio: 'inherit', // Show output in current console
      env: { ...process.env } // Pass environment variables
    });
    
    nodeProcess.on('error', (err) => {
      console.error('Failed to start backend:', err);
    });
    
    resolve(nodeProcess);
  });
}

/**
 * Main startup function
 */
async function startDevelopmentEnvironment() {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  News Reader Development Environment Setup  │');
  console.log('└─────────────────────────────────────────────┘');
  
  try {
    // Check if MongoDB is already running
    const isMongoRunning = await checkMongoDBRunning();
    
    // Start MongoDB if not already running
    if (!isMongoRunning) {
      await startMongoDB();
    }
    
    // Give MongoDB a moment to initialize
    console.log('Waiting for MongoDB to initialize...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start the backend application
    const backendProcess = await startBackend();
    
    // Handle cleanup when the script is terminated
    process.on('SIGINT', async () => {
      console.log('\nShutting down development environment...');
      
      // Kill backend process
      if (backendProcess) {
        console.log('Stopping backend service...');
        backendProcess.kill();
        console.log('Backend service stopped.');
      }
      
      // Check if this MongoDB instance is only used by our project
      console.log('Checking if MongoDB is used by other applications...');
      exec(`lsof -i :${MONGODB_PORT} | grep -v ${process.pid}`, async (error, stdout, stderr) => {
        // If error or no output, no other processes are using MongoDB
        if (error || !stdout) {
          console.log('No other applications are using MongoDB. Safe to shut down.');
          // Get MongoDB process ID
          exec('pgrep -f "mongod --dbpath=' + DATA_DIR + '"', (err, pidOutput) => {
            if (!err && pidOutput.trim()) {
              const mongoPid = pidOutput.trim();
              console.log(`Shutting down MongoDB (PID: ${mongoPid})...`);
              exec(`kill ${mongoPid}`, (killErr) => {
                if (killErr) {
                  console.error('Error shutting down MongoDB:', killErr);
                } else {
                  console.log('MongoDB shut down successfully.');
                }
                process.exit(0);
              });
            } else {
              console.log('Could not find MongoDB process to shut down.');
              process.exit(0);
            }
          });
        } else {
          console.log('Other applications are using MongoDB. Leaving it running.');
          process.exit(0);
        }
      });
    });
    
    console.log(`\nDevelopment environment is ready!`);
    console.log(`Backend available at: http://localhost:${APP_PORT}`);
    console.log(`Health check: http://localhost:${APP_PORT}/api/health`);
    console.log('\nPress Ctrl+C to stop the development environment.');
  } catch (error) {
    console.error('Failed to start development environment:', error);
  }
}

// Start everything
startDevelopmentEnvironment();
