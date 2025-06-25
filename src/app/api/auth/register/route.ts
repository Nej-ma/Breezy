import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    console.log("Registration request:", requestBody);

    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

    const response = await fetch(`${backendUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      console.error("Raw response:", responseText);
      return NextResponse.json(
        { error: "Invalid response from server" },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Registration failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
