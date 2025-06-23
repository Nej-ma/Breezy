// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
   
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
   
    // Appeler votre backend pour authentifier
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
   
    // Créer une session côté Next.js avec les données utilisateur
    const userId = data.user.id || data.user._id;
    const expiresAt = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7); // 7 jours
      
    await createSession({
      userId,
      role: data.user.role,
      username: data.user.username,
      email: data.user.email,
      displayName: data.user.displayName,
      isVerified: data.user.isVerified,
      expiresAt
    });
   
    // IMPORTANT: Stocker aussi le token backend pour les requêtes API
    const nextResponse = NextResponse.json({
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

    // Ajouter le token backend comme cookie HTTP-only
    if (data.token) {
      nextResponse.cookies.set('backend_token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 jours
      });
    }

    return nextResponse;
   
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
