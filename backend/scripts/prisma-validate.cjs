const { spawnSync } = require('child_process');

const path = require('path');

const prismaCli = path.resolve(__dirname, '../node_modules/prisma/build/index.js');
const result = spawnSync(process.execPath, [prismaCli, 'validate'], {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
  env: {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/account_asset?schema=public',
  },
});

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
