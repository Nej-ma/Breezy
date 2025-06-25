import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export async function POST() {
  try {
    const session = await getSession();
    const cookieStore = await cookies();
    const backendToken = cookieStore.get('backend_token')?.value;
    
    
    if (!session?.isLoggedIn || !backendToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/users/sync-counts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${backendToken}`,
        "Content-Type": "application/json",
      },
    });

    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to sync counts" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in sync counts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
