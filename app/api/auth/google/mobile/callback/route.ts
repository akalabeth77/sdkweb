import { NextResponse } from 'next/server';
import { findAppUserByEmail, createGoogleUser } from '@/lib/users';
import { signMobileToken } from '@/lib/mobile-auth';

const APP_CALLBACK = 'sdkapp://oauth2callback';

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

type GoogleUserInfo = {
  email?: string;
  name?: string;
  verified_email?: boolean;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://sdkweb.vercel.app';

  if (error || !code || !state) {
    return NextResponse.redirect(`${APP_CALLBACK}?error=${encodeURIComponent(error ?? 'cancelled')}`);
  }

  // Recover code_verifier from state
  let codeVerifier: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
    codeVerifier = decoded.cv;
    if (!codeVerifier) throw new Error();
  } catch {
    return NextResponse.redirect(`${APP_CALLBACK}?error=invalid_state`);
  }

  // Exchange authorization code for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${baseUrl}/api/auth/google/mobile/callback`,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${APP_CALLBACK}?error=token_exchange_failed`);
  }

  const { access_token } = (await tokenRes.json()) as GoogleTokenResponse;
  if (!access_token) {
    return NextResponse.redirect(`${APP_CALLBACK}?error=no_access_token`);
  }

  // Get user info from Google
  const userRes = await fetch(
    `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`
  );
  if (!userRes.ok) {
    return NextResponse.redirect(`${APP_CALLBACK}?error=userinfo_failed`);
  }

  const googleUser = (await userRes.json()) as GoogleUserInfo;
  if (!googleUser.email || !googleUser.verified_email) {
    return NextResponse.redirect(`${APP_CALLBACK}?error=unverified_email`);
  }

  // Find or create AppUser
  let user = await findAppUserByEmail(googleUser.email);
  if (!user) {
    try {
      await createGoogleUser({
        email: googleUser.email,
        name: googleUser.name || googleUser.email,
      });
    } catch {
      return NextResponse.redirect(`${APP_CALLBACK}?error=registration_failed`);
    }
    return NextResponse.redirect(`${APP_CALLBACK}?pending=true`);
  }

  if (user.status === 'pending') {
    return NextResponse.redirect(`${APP_CALLBACK}?pending=true`);
  }
  if (user.status === 'rejected') {
    return NextResponse.redirect(`${APP_CALLBACK}?error=rejected`);
  }

  // Sign our own mobile JWT and send back to app
  const token = signMobileToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.redirect(
    `${APP_CALLBACK}?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name)}&role=${encodeURIComponent(user.role)}&id=${encodeURIComponent(user.id)}`
  );
}
