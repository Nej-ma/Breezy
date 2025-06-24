// src/app/api/posts/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const backendToken = cookieStore.get('backend_token')?.value;
    
    if (!backendToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userIds = searchParams.getAll('userIds');
    
    if (userIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one userId is required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    // Construire l'URL avec les paramètres userIds
    const queryParams = new URLSearchParams();
    userIds.forEach(id => queryParams.append('userIds', id));
    
    const response = await fetch(`${backendUrl}/posts/users?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${backendToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching posts for users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts for users' },
      { status: 500 }
    );
  }
}
