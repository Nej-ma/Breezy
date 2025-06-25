import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log("Follow API called for userId:", userId);
    const session = await getSession();
    const cookieStore = await cookies();
    const backendToken = cookieStore.get('backend_token')?.value;
    
    if (!session?.isLoggedIn || !backendToken) {
      console.log("Follow API: Unauthorized access");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Making follow request to backend:", `${API_URL}/users/${userId}/follow`);
    const response = await fetch(`${API_URL}/users/${userId}/follow`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${backendToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Backend follow response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("Backend follow error:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to follow user" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend follow success:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in follow API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
