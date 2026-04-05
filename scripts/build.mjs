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

function runWithResult(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    stdio: 'pipe',
    shell: process.platform === 'win32',
    env,
    encoding: 'utf8',
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  return result;
}

const shouldRunMigrations = Boolean(process.env.VERCEL && process.env.DATABASE_URL);

if (shouldRunMigrations) {
  if (!process.env.DIRECT_URL) {
    console.error('DIRECT_URL is required for Prisma migrations on Vercel when DATABASE_URL uses a pooled connection.');
    console.error('Set DIRECT_URL to the direct Postgres connection string from Supabase or Neon.');
    process.exit(1);
  }

  console.log('Running Prisma migrations for Vercel build using DIRECT_URL...');
  const migrationEnv = {
    ...process.env,
    DATABASE_URL: process.env.DIRECT_URL,
  };

  const migrateResult = runWithResult('npx', ['prisma', 'migrate', 'deploy'], migrationEnv);
  if (migrateResult.status !== 0) {
    const output = `${migrateResult.stdout ?? ''}\n${migrateResult.stderr ?? ''}`;
    if (output.includes('P3005')) {
      console.warn('Detected P3005 (existing schema without Prisma migration history). Falling back to prisma db push.');
      const dbPushResult = runWithResult('npx', ['prisma', 'db', 'push'], migrationEnv);
      if (dbPushResult.status !== 0) {
        process.exit(dbPushResult.status ?? 1);
      }
    } else {
      process.exit(migrateResult.status ?? 1);
    }
  }
} else {
  console.log('Skipping Prisma migrate deploy for non-Vercel or missing DATABASE_URL.');
}

run('npx', ['next', 'build']);