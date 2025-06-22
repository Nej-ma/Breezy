import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    // Get session from secure cookie
    const session = await getSession();
   
    if (!session?.isLoggedIn) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
   
    // Retourner directement les données de session
    // Pas besoin d'appeler le backend pour /auth/me
    return NextResponse.json({ 
      user: {
        id: session.userId,
        _id: session.userId,
        username: session.username,
        role: session.role,
        // Ajouter d'autres champs si nécessaire depuis la session
      }
    });
   
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}
