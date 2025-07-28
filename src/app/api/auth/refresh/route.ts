
// ===== src/app/api/auth/refresh/route.ts =====
import { NextRequest, NextResponse } from 'next/server';
import { createSession, getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Récupérer le token backend depuis les cookies
    const backendToken = request.cookies.get('backend_token')?.value;
    
    if (!backendToken) {
      return NextResponse.json(
        { error: 'No backend token found' },
        { status: 401 }
      );
    }

    // Essayer de rafraîchir le token avec le backend
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    const response = await fetch(`${backendUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${backendToken}`
      },
    });

    if (!response.ok) {
      // Si le refresh backend échoue, vérifier si on a encore une session valide
      const currentSession = await getSession();
      if (currentSession?.isLoggedIn) {
        return NextResponse.json({
          user: {
            id: currentSession.userId,
            _id: currentSession.userId,
            username: currentSession.username,
            role: currentSession.role,
            email: currentSession.email,
            displayName: currentSession.displayName,
            isVerified: currentSession.isVerified,
          }
        });
      }
      
      return NextResponse.json(
        { error: 'Token refresh failed' },
        { status: 401 }
      );
    }

    const data = await response.json();
    
    // Récupérer les données utilisateur mises à jour
    const userResponse = await fetch(`${backendUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${data.token}`,
      },
    });
    
    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get updated user data' },
        { status: 500 }
      );
    }
    
    const userData = await userResponse.json();
    const user = userData.user || userData.data || userData;
    
    // Créer une nouvelle session
    const userId = user.id || user._id;
    const expiresAt = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7);
    
    await createSession({
      userId,
      role: user.role,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      isVerified: user.isVerified,
      expiresAt
    });

    const nextResponse = NextResponse.json({
      user: {
        id: userId,
        _id: userId,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isVerified: user.isVerified,
      }
    });

    // Mettre à jour le token backend
    if (data.token) {
      nextResponse.cookies.set('backend_token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      });
    }

    return nextResponse;
    
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
