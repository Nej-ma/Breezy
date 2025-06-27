
// ===== src/app/api/auth/me/route.ts =====
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
   
    if (!session?.isLoggedIn) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      user: {
        id: session.userId,
        _id: session.userId,
        username: session.username,
        role: session.role,
        email: session.email,
        displayName: session.displayName,
        isVerified: session.isVerified,
        isSuspended: session.isSuspended,
        suspendedUntil: session.suspendedUntil,
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
