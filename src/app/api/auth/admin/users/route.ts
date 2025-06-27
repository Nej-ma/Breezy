import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const role = searchParams.get('role');
    const suspended = searchParams.get('suspended');
    
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (role) queryParams.append('role', role);
    if (suspended) queryParams.append('suspended', suspended);
    
    // Get session instead of authorization header
    const session = await getSession();
    if (!session?.isLoggedIn) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin/moderator permissions
    if (session.role !== 'admin' && session.role !== 'moderator') {
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
    const response = await fetch(`${API_URL}/auth/admin/users?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${backendToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get all users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
