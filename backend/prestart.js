// Pre-start script to kill any process using port 5000
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function killPort(port) {
  console.log(`Checking port ${port}...`);
  
  try {
    const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
    
    if (!stdout) {
      console.log(`Port ${port} is free`);
      return true;
    }

    const lines = stdout.trim().split('\n');
    const pids = [...new Set(
      lines
        .map(line => {
          const parts = line.trim().split(/\s+/);
          return parts[parts.length - 1];
        })
        .filter(pid => pid && !isNaN(parseInt(pid)))
    )];

    if (pids.length === 0) {
      console.log(`No processes found on port ${port}`);
      return true;
    }

    console.log(`Killing ${pids.length} process(es): ${pids.join(', ')}`);

    for (const pid of pids) {
      try {
        await execPromise(`taskkill /F /PID ${pid}`);
        console.log(`Killed process ${pid}`);
      } catch (e) {
        console.log(`Could not kill ${pid}`);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Port ${port} cleared`);
    return true;
  } catch (err) {
    console.log(`Port ${port} is free`);
    return true;
  }
}

killPort(5000).then(() => {
  console.log('Starting server...');
  process.exit(0);
});
