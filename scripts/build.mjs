import { spawnSync } from 'node:child_process';

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const shouldRunMigrations = Boolean(process.env.VERCEL && process.env.DATABASE_URL);

if (shouldRunMigrations) {
  console.log('Running Prisma migrations for Vercel build...');
  run('npx', ['prisma', 'migrate', 'deploy']);
} else {
  console.log('Skipping Prisma migrate deploy for non-Vercel or missing DATABASE_URL.');
}

run('npx', ['next', 'build']);