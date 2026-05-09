const { spawn } = require('child_process');
const path = require('path');

console.log('========================================');
console.log('  Fair Acres Hotel Management System');
console.log('========================================\n');

const isWindows = process.platform === 'win32';

// Start Backend
console.log('Starting Backend Server...');
const backend = spawn(isWindows ? 'npm.cmd' : 'npm', ['start'], {
  cwd: path.join(__dirname, 'Backend'),
  stdio: 'inherit',
  shell: true
});

// Wait a bit before starting frontend
setTimeout(() => {
  console.log('\nStarting Frontend...');
  const frontend = spawn(isWindows ? 'npm.cmd' : 'npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'Frontend'),
    stdio: 'inherit',
    shell: true
  });

  console.log('\n========================================');
  console.log('Both servers are running!');
  console.log('Backend: http://localhost:8000');
  console.log('Frontend: http://localhost:5173');
  console.log('========================================\n');
  console.log('Press Ctrl+C to stop both servers\n');

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n\nShutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

  frontend.on('exit', () => {
    backend.kill();
    process.exit(0);
  });

  backend.on('exit', () => {
    frontend.kill();
    process.exit(0);
  });
}, 3000);
