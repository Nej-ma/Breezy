import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
   
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
   
    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
   
    const data = await response.json();
   
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Login failed' },
        { status: response.status }
      );
    }
   
    // Create session with user data
    const userId = data.user.id || data.user._id;
    const expiresAt = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7); // 7 days
    
    await createSession({
      userId,
      role: data.user.role,
      username: data.user.username,
      expiresAt
    });
   
    // Return user data (pas le token sensible)
    return NextResponse.json({
      user: {
        id: userId,
        _id: userId,
        username: data.user.username,
        email: data.user.email,
        displayName: data.user.displayName,
        role: data.user.role,
        isVerified: data.user.isVerified,
      }
    });
   
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
