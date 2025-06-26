// src/app/api/posts/route.ts
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

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    // Récupérer les paramètres de requête de l'URL
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    // Construire l'URL avec les paramètres de requête
    const backendApiUrl = queryString 
      ? `${backendUrl}/posts?${queryString}`
      : `${backendUrl}/posts`;
    
    const response = await fetch(backendApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${backendToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Handle different HTTP status codes appropriately
      let errorMessage = 'Failed to fetch posts';
      const statusCode = response.status;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response body is not JSON, use default message
        if (response.status === 429) {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed';
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden';
        } else if (response.status === 404) {
          errorMessage = 'Posts not found';
        } else if (response.status >= 500) {
          errorMessage = 'Backend server error';
        }
      }

      console.error(`Backend error (${response.status}):`, errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const backendToken = cookieStore.get('backend_token')?.value;
    
    if (!backendToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    
    const response = await fetch(`${backendUrl}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${backendToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create post';
      const statusCode = response.status;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('❌ Backend error:', errorData);
        return NextResponse.json(errorData, { status: statusCode });
      } catch {
        // If response body is not JSON, use appropriate message
        if (response.status === 429) {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed';
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden';
        } else if (response.status === 404) {
          errorMessage = 'Resource not found';
        } else if (response.status >= 500) {
          errorMessage = 'Backend server error';
        }
        
        console.error(`❌ Backend error (${response.status}):`, errorMessage);
        return NextResponse.json(
          { error: errorMessage },
          { status: statusCode }
        );
      }
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
    
  } catch (error) {
    console.error('💥 Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
