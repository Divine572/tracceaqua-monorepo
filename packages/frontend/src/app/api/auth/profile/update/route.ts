import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

// const baseUrl = "https://api.tracceaqua.com"

export async function PUT(req: NextRequest) {
  const body = await req.json();

  const cookieStore = cookies();

  const userToken = (await cookieStore).get("user-token")?.value;

  try {
    const response = await axios.put(
      `${process.env.BACKEND_URL_DEV}/auth/profile`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`
        },
      }
    );

    if (response.status !== 200)
      throw new Error("Failed to update your profile");

    return NextResponse.json({ data: response.data });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
