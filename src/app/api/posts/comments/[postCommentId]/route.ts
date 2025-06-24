import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ postCommentId: string }> }
) {
  const params = await context.params;
  try {
    const cookieStore = await cookies();
    const backendToken = cookieStore.get("backend_token")?.value;

    if (!backendToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

    const response = await fetch(
      `${backendUrl}/posts/comments/${params.postCommentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${backendToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postCommentId: string }> }
) {
  const params = await context.params;

  try {
    const cookieStore = await cookies();
    const backendToken = cookieStore.get("backend_token")?.value;

    if (!backendToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

    const response = await fetch(
      `${backendUrl}/posts/comments/${params.postCommentId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${backendToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

// with comment id
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ postCommentId: string }> }
) {
  const params = await context.params;

  try {
    const cookieStore = await cookies();
    const backendToken = cookieStore.get("backend_token")?.value;

    if (!backendToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

    const response = await fetch(
      `${backendUrl}/posts/comments/${params.postCommentId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${backendToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ postCommentId: string }> }
) {
  const params = await context.params;

  try {
    const cookieStore = await cookies();
    const backendToken = cookieStore.get("backend_token")?.value;

    if (!backendToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

    const response = await fetch(
      `${backendUrl}/posts/comments/${params.postCommentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${backendToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
