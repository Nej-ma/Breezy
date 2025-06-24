// src/app/api/users/id/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface RouteParams {
  params: Promise<{
    id: string;
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

    const response = await fetch(
      `${backendUrl}/users/id/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${backendToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Get user by username error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
