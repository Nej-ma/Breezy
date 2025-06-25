import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const params = await context.params;

    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

    const response = await fetch(
      `${backendUrl}/auth/activate/${params.token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.text();
    console.log("Backend response:", data);

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      console.error("Error parsing response:", e);
      return NextResponse.json(
        { error: "Invalid response from server", raw: data },
        { status: response.status }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: jsonData.message || "Account activation failed",
          details: jsonData,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: "Account activated successfully",
      ...jsonData,
    });
  } catch (error) {
    console.error("Error during account activation:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
