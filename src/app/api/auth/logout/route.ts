
// ===== src/app/api/auth/logout/route.ts =====
import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const backendToken = request.cookies.get('backend_token')?.value;
    
    // Appeler le backend pour logout si on a un token
    if (backendToken) {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
      
      try {
        await fetch(`${backendUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${backendToken}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (backendError) {
        console.warn('Backend logout failed:', backendError);
        // Continue même si le backend échoue
      }
    }
    
    // Supprimer la session locale
    await deleteSession();
    
    // Créer la réponse et supprimer les cookies
    const response = NextResponse.json({ success: true });
    response.cookies.delete('backend_token');
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}