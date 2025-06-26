import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    
    console.log('Suspend route called with userId:', userId, 'body:', body);
    
    // Get session to check permissions
    const session = await getSession();
    console.log('Session:', session);
    
    if (!session?.isLoggedIn) {
      console.log('No session or not logged in');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin/moderator permissions
    if (session.role !== 'admin' && session.role !== 'moderator') {
      console.log('Insufficient permissions, role:', session.role);
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get backend token from cookies
    const cookieStore = await cookies();
    const backendToken = cookieStore.get("backend_token")?.value;
    
    if (!backendToken) {
      return NextResponse.json(
        { error: "Backend token not found" },
        { status: 401 }
      );
    }

    // Forward the request to the auth service via API gateway
    console.log('Calling backend via API gateway:', `${API_URL}/auth/admin/users/${userId}/suspend`);
    const response = await fetch(`${API_URL}/auth/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${backendToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Backend response:', response.status, data);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Suspend user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
