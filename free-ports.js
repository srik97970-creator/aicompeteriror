const { execSync } = require('child_process');

const ports = [5005, 5173];

console.log('Checking for processes occupying ports 5005 or 5173...');

ports.forEach(port => {
  try {
    let output;
    if (process.platform === 'win32') {
      output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    } else {
      output = execSync(`lsof -t -i:${port}`, { encoding: 'utf8' });
    }

    if (output) {
      const lines = output.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (process.platform === 'win32') {
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && !isNaN(pid)) {
            pids.add(parseInt(pid));
          }
        } else {
          if (line && !isNaN(line)) {
            pids.add(parseInt(line));
          }
        }
      });

      pids.forEach(pid => {
        if (pid !== process.pid) {
          console.log(`Cleaning up zombie process ${pid} using port ${port}...`);
          try {
            if (process.platform === 'win32') {
              execSync(`taskkill /f /pid ${pid}`, { stdio: 'ignore' });
            } else {
              process.kill(pid, 'SIGKILL');
            }
          } catch (e) {
            // Ignore error if process already exited
          }
        }
      });
    }
  } catch (error) {
    // findstr or lsof returns exit code 1 when no match is found, which is normal.
  }
});

console.log('Ports are clean.');
