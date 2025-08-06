const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Relationship Mapping Slack App Demo...\n');

// Start backend server
console.log('📡 Starting backend server...');
const backend = spawn('node', ['src/server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Wait a moment for backend to start, then start frontend
setTimeout(() => {
  console.log('\n🎨 Starting frontend...');
  const frontend = spawn('npm', ['start'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, 'client')
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down demo...');
    backend.kill();
    frontend.kill();
    process.exit();
  });

  frontend.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
    backend.kill();
    process.exit();
  });
}, 3000);

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit();
});

console.log('\n✅ Demo starting up...');
console.log('📱 Frontend will be available at: http://localhost:3000');
console.log('🔧 Backend API will be available at: http://localhost:3001');
console.log('🎯 Click "Try Demo Version" to experience the app!');
console.log('\nPress Ctrl+C to stop the demo\n'); 