import { spawnSync } from 'node:child_process';

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const shouldRunMigrations = Boolean(process.env.VERCEL && process.env.DATABASE_URL);

if (shouldRunMigrations) {
  if (!process.env.DIRECT_URL) {
    console.error('DIRECT_URL is required for Prisma migrations on Vercel when DATABASE_URL uses a pooled connection.');
    console.error('Set DIRECT_URL to the direct Postgres connection string from Supabase or Neon.');
    process.exit(1);
  }

  console.log('Running Prisma migrations for Vercel build using DIRECT_URL...');
  run('npx', ['prisma', 'migrate', 'deploy'], {
    ...process.env,
    DATABASE_URL: process.env.DIRECT_URL,
  });
} else {
  console.log('Skipping Prisma migrate deploy for non-Vercel or missing DATABASE_URL.');
}

run('npx', ['next', 'build']);