// src/app/api/posts/search/tags/route.ts
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
    const tags = searchParams.getAll('tags');
    const limit = searchParams.get('limit');
    const skip = searchParams.get('skip');
    
    if (tags.length === 0) {
      return NextResponse.json(
        { error: 'At least one tag is required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    // Construire l'URL avec les paramètres de recherche
    const queryParams = new URLSearchParams();
    tags.forEach(tag => queryParams.append('tags', tag));
    if (limit) queryParams.append('limit', limit);
    if (skip) queryParams.append('skip', skip);
      const response = await fetch(`${backendUrl}/posts/search?${queryParams.toString()}`, {
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
    console.error('Error searching posts by tags:', error);
    return NextResponse.json(
      { error: 'Failed to search posts by tags' },
      { status: 500 }
    );
  }
}
