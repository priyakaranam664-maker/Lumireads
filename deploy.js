const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envData = JSON.parse(fs.readFileSync('deploy_env.json', 'utf8'));
const envString = JSON.stringify(envData);

// Resolve npx entry point relative to node.exe — no shell involved
const nodeDir = path.dirname(process.execPath);
const npxCli = path.join(nodeDir, 'node_modules', 'npm', 'bin', 'npx-cli.js');

console.log('node:', process.execPath);
console.log('npx-cli:', npxCli);
console.log('Deploying...');

execFileSync(process.execPath, [
    npxCli, '@insforge/cli', 'deployments', 'deploy', '--env', envString, '.'
], { stdio: 'inherit', cwd: __dirname });

console.log('Done!');
