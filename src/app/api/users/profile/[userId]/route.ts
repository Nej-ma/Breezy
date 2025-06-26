import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const backendToken = cookieStore.get("backend_token")?.value;

    if (!backendToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const params = await context.params;

    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

    const response = await fetch(
      `${backendUrl}/users/profile/${params.userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${backendToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      let errorMessage = "Failed to delete user";
      const statusCode = response.status;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error("❌ Backend error:", errorData);
        return NextResponse.json(errorData, { status: statusCode });
      } catch {
        // If response body is not JSON, use appropriate message
        if (response.status === 429) {
          errorMessage = "Too many requests. Please try again later.";
        } else if (response.status === 401) {
          errorMessage = "Authentication failed";
        } else if (response.status === 403) {
          errorMessage = "Access forbidden";
        } else if (response.status === 404) {
          errorMessage = "User not found";
        } else if (response.status >= 500) {
          errorMessage = "Backend server error";
        }

        console.error(`❌ Backend error (${response.status}):`, errorMessage);
        return NextResponse.json(
          { error: errorMessage },
          { status: statusCode }
        );
      }
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("💥 Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
