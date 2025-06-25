import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export async function POST() {
  try {
    console.log("Sync counts API called");
    const session = await getSession();
    const cookieStore = await cookies();
    const backendToken = cookieStore.get('backend_token')?.value;
    
    
    if (!session?.isLoggedIn || !backendToken) {
      console.log("Sync counts API: Unauthorized access");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Making sync request to backend:", `${API_URL}/users/sync-counts`);
    const response = await fetch(`${API_URL}/users/sync-counts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${backendToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Backend sync response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("Backend sync error:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to sync counts" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend sync success:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in sync counts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
