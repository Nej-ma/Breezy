// src/app/api/users/username/[username]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface RouteParams {
  params: Promise<{
    username: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const backendToken = cookieStore.get("backend_token")?.value;
    if (!backendToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { username } = await params;
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
   
    console.log(`📡 Fetching user profile for username: ${username}`);
    console.log(`🔗 Backend URL: ${backendUrl}/users/username/${encodeURIComponent(username)}`);
   
    const response = await fetch(
      `${backendUrl}/users/username/${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${backendToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`📡 Backend response status: ${response.status}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`❌ User not found: ${username}`);
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      const errorText = await response.text();
      console.error(`❌ Backend error (${response.status}):`, errorText);
      throw new Error(`Backend responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched user profile for: ${username}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Get user by username error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}