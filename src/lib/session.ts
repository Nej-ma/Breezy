import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Types
export interface SessionPayload {
  userId: string;
  role: string;
  username: string;
  email?: string;
  displayName?: string;
  isVerified?: boolean;
  isSuspended?: boolean;
  suspendedUntil?: string | null;
  expiresAt: number;
}

export interface Session extends SessionPayload {
  isLoggedIn: boolean;
}

interface JWTSessionPayload extends JWTPayload {
  userId: string;
  role: string;
  username: string;
  email?: string;
  displayName?: string;
  isVerified?: boolean;
  isSuspended?: boolean;
  suspendedUntil?: string | null;
  expiresAt: number;
}

// Constants
const SESSION_KEY = 'breezy_session';
const TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days

// Helper function to get secret key
const getSecretKey = (): Uint8Array => {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET is not defined or too short (min 32 chars)');
  }
  return new TextEncoder().encode(secret);
};

// Encrypt session data into JWT
export async function encrypt(payload: SessionPayload): Promise<string> {
  const secretKey = getSecretKey();
    const jwtPayload: JWTSessionPayload = {
    userId: payload.userId,
    role: payload.role,
    username: payload.username,
    email: payload.email,
    displayName: payload.displayName,
    isVerified: payload.isVerified,
    expiresAt: payload.expiresAt
  };
  
  const token = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .sign(secretKey);
   
  return token;
}

// Decrypt JWT back to session data
export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
      // Check if token has expired
    const now = Math.floor(Date.now() / 1000);
    const sessionPayload = payload as JWTSessionPayload;
    if (sessionPayload.expiresAt && sessionPayload.expiresAt < now) {
      return null;
    }
      return {
      userId: sessionPayload.userId,
      role: sessionPayload.role,
      username: sessionPayload.username,
      email: sessionPayload.email,
      displayName: sessionPayload.displayName,
      isVerified: sessionPayload.isVerified,
      isSuspended: sessionPayload.isSuspended,
      suspendedUntil: sessionPayload.suspendedUntil,
      expiresAt: sessionPayload.expiresAt
    };
  } catch (error) {
    return null;
  }
}

// Create a session by setting cookies
export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await encrypt(payload);
   // Set HTTP-only cookie with JWT token
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_KEY,
    value: token, // JWT token, not user data
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_EXPIRY
  });
}

// Delete session by removing cookies
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_KEY);
}

// Get current session from cookies
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_KEY)?.value;
 
  if (!sessionCookie) {
    return null;
  }
 
  const session = await decrypt(sessionCookie);
 
  if (!session) {
    return null;
  }
 
  return { ...session, isLoggedIn: true };
}

// Get session from NextRequest (for middleware)
export async function getSessionFromRequest(request: NextRequest): Promise<Session | null> {
  const sessionCookie = request.cookies.get(SESSION_KEY)?.value;
 
  if (!sessionCookie) {
    return null;
  }
 
  const session = await decrypt(sessionCookie);
 
  if (!session) {
    return null;
  }
 
  return { ...session, isLoggedIn: true };
}
