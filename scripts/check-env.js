// scripts/check-env.js
// Kontrola existencie kritických environment premenných pre build

const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

const vercelRequiredVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

const isVercel = process.env.VERCEL === '1';
const varsToCheck = isVercel ? vercelRequiredVars : requiredVars;

console.log(`\n🔍 Checking environment variables (Vercel: ${isVercel ? 'YES' : 'NO'})...`);

let allPresent = true;

for (const varName of varsToCheck) {
  if (!process.env[varName]) {
    console.error(`❌ Missing required env var: ${varName}`);
    allPresent = false;
  } else {
    // Show that it's present (but not the value for security)
    const value = process.env[varName];
    const maskedValue = varName.includes('SECRET') || varName.includes('TOKEN') 
      ? '***' 
      : `${value.substring(0, 20)}...`;
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
}

// Optional vars
const optionalVars = ['API_REFRESH_TOKEN', 'JWT_SECRET', 'FACEBOOK_PAGE_ID', 'GOOGLE_CALENDAR_ID'];
for (const varName of optionalVars) {
  if (process.env[varName]) {
    console.log(`ℹ️  ${varName}: set`);
  } else {
    console.log(`⚠️  ${varName}: not set (optional)`);
  }
}

if (!allPresent) {
  console.error('\n❌ Build cannot continue due to missing environment variables.');
  console.error('Please set them in Vercel Project Settings → Environment Variables.');
  process.exit(1);
}

console.log('\n✅ All required environment variables are present.');
