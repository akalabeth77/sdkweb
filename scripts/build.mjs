import { spawnSync } from 'node:child_process';

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env,
  });

  if (result.status !== 0) {
    console.error(`Command failed: ${command} ${args.join(' ')}`);
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

console.log('Starting build process...');
console.log('VERCEL env:', process.env.VERCEL ? 'true' : 'false');
console.log('DATABASE_URL set:', process.env.DATABASE_URL ? 'true' : 'false');
console.log('DIRECT_URL set:', process.env.DIRECT_URL ? 'true' : 'false');

const shouldRunMigrations = Boolean(process.env.VERCEL && process.env.DATABASE_URL);

if (shouldRunMigrations) {
  if (!process.env.DIRECT_URL) {
    console.error('\n❌ ERROR: DIRECT_URL is required for Prisma migrations on Vercel.');
    console.error('Set DIRECT_URL in Vercel Project Settings → Environment Variables.');
    console.error('Use the direct Postgres connection (port 5432), not the pooler (port 6543).');
    process.exit(1);
  }

  console.log('\n🔄 Running Prisma migrations...');
  const migrationEnv = {
    ...process.env,
    DATABASE_URL: process.env.DIRECT_URL,
  };

  const migrateResult = runWithResult('npx', ['prisma', 'migrate', 'deploy'], migrationEnv);
  if (migrateResult.status !== 0) {
    const output = `${migrateResult.stdout ?? ''}\n${migrateResult.stderr ?? ''}`;
    
    if (output.includes('P3005')) {
      console.warn('\n⚠️ Detected P3005 error (existing schema without migration history).');
      console.warn('Falling back to prisma db push...');
      const dbPushResult = runWithResult('npx', ['prisma', 'db', 'push'], migrationEnv);
      if (dbPushResult.status !== 0) {
        console.error('\n❌ prisma db push failed!');
        process.exit(dbPushResult.status ?? 1);
      }
    } else {
      console.error('\n❌ Prisma migration failed!');
      process.exit(migrateResult.status ?? 1);
    }
  } else {
    console.log('✅ Prisma migrations completed successfully.');
  }
} else {
  console.log('\n⏭️ Skipping Prisma migrations (not on Vercel or DATABASE_URL not set).');
}

console.log('\n🏗️ Running Next.js build...');
run('npx', ['--no-install', 'next', 'build']);
console.log('✅ Build completed successfully!');