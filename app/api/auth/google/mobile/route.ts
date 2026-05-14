import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Starts Google OAuth for mobile — mobile opens this URL in WebBrowser,
// we redirect to Google, Google redirects back to /callback, which then
// deep-links back into the app with sdkapp://
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://sdkweb.vercel.app';

  if (!clientId) {
    return NextResponse.redirect(`sdkapp://oauth2callback?error=not_configured`);
  }

  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // Encode codeVerifier in state so callback can use it (no server-side session needed)
  const state = Buffer.from(JSON.stringify({ cv: codeVerifier })).toString('base64url');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${baseUrl}/api/auth/google/mobile/callback`,
    response_type: 'code',
    scope: 'openid profile email',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
