import { spawn } from 'node:child_process';

console.log('\x1b[36m%s\x1b[0m', '🚀 Launching BioAccess Monorepo (Backend :3001 + Frontend :3000)...');

const backend = spawn('npm', ['--workspace=backend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '3001' },
});

const frontend = spawn('npm', ['--workspace=frontend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '3000', BACKEND_URL: 'http://localhost:3001' },
});

function cleanup() {
  console.log('\n\x1b[33m%s\x1b[0m', '🛑 Shutting down backend and frontend...');
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

backend.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(`Backend process exited with code ${code}`);
  }
});

frontend.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(`Frontend process exited with code ${code}`);
  }
});
