import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import express from 'express';

const app = express();
const PORT = 7860;

let sessionInfo = {
  ready: false,
  sshString: '',
  webString: '',
  status: 'Initializing...'
};

console.log('Starting tmate session...\n');

// Start tmate in a new session
const tmate = spawn('tmate', ['-F'], {
  stdio: ['inherit', 'pipe', 'pipe']
});

// Path to tmate socket file
const socketPath = path.join(os.homedir(), '.tmate.socket');

// Wait for tmate to initialize and create the socket
const checkSocket = setInterval(() => {
  if (fs.existsSync(socketPath)) {
    clearInterval(checkSocket);
    
    // Give tmate a moment to fully initialize
    setTimeout(() => {
      // Get SSH connection string
      const tmateSSH = spawn('tmate', ['display', '-p', '#{tmate_ssh}']);
      const tmateWeb = spawn('tmate', ['display', '-p', '#{tmate_web}']);
      
      let sshString = '';
      let webString = '';
      
      tmateSSH.stdout.on('data', (data) => {
        sshString += data.toString();
      });
      
      tmateWeb.stdout.on('data', (data) => {
        webString += data.toString();
      });
      
      tmateSSH.on('close', () => {
        sessionInfo.sshString = sshString.trim();
        sessionInfo.webString = webString.trim();
        sessionInfo.ready = true;
        sessionInfo.status = 'Active';
        
        console.log('='.repeat(60));
        console.log('TMATE SESSION READY');
        console.log('='.repeat(60));
        console.log('\nSSH Connection String:');
        console.log(sessionInfo.sshString);
        console.log('\nWeb Access:');
        console.log(sessionInfo.webString);
        console.log('\n' + '='.repeat(60));
        console.log('\nSession is active. Press Ctrl+C to end the session.');
        console.log(`API available at: http://localhost:${PORT}`);
        console.log('='.repeat(60) + '\n');
      });
    }, 2000);
  }
}, 100);

// Handle stdout from tmate
tmate.stdout.on('data', (data) => {
  process.stdout.write(data);
});

// Handle stderr from tmate
tmate.stderr.on('data', (data) => {
  process.stderr.write(data);
});

// Handle tmate exit
tmate.on('close', (code) => {
  console.log(`\nTmate session ended (exit code: ${code})`);
  sessionInfo.ready = false;
  sessionInfo.status = 'Terminated';
  process.exit(code);
});

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\nShutting down tmate session and server...');
  tmate.kill('SIGTERM');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

// Timeout if socket doesn't appear within 10 seconds
setTimeout(() => {
  if (!fs.existsSync(socketPath)) {
    console.error('Error: Tmate failed to start. Make sure tmate is installed.');
    console.error('Install with: sudo apt install tmate (Ubuntu/Debian) or brew install tmate (macOS)');
    sessionInfo.status = 'Failed to start';
    tmate.kill();
    process.exit(1);
  }
}, 10000);

// Express routes
app.get('/', (req, res) => {
  res.json({
    ready: sessionInfo.ready,
    status: sessionInfo.status,
    ssh: sessionInfo.sshString,
    web: sessionInfo.webString
  });
});

app.get('/ssh', (req, res) => {
  if (sessionInfo.ready) {
    res.send(sessionInfo.sshString);
  } else {
    res.status(503).send('Session not ready yet');
  }
});

app.get('/web', (req, res) => {
  if (sessionInfo.ready) {
    res.send(sessionInfo.webString);
  } else {
    res.status(503).send('Session not ready yet');
  }
});

app.get('/status', (req, res) => {
  res.json({
    ready: sessionInfo.ready,
    status: sessionInfo.status
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET /       - Full session info (JSON)`);
  console.log(`  GET /ssh    - SSH connection string`);
  console.log(`  GET /web    - Web access URL`);
  console.log(`  GET /status - Session status\n`);
});