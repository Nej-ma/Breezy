import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    
    // Get session instead of authorization header
    const session = await getSession();
    if (!session?.isLoggedIn) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin permissions (only admins can change roles)
    if (session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can change user roles' },
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
    const response = await fetch(`${API_URL}/auth/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${backendToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Change user role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
