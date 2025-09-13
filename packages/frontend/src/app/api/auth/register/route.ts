import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { UserData } from "@/lib/types";

// const baseUrl = "https://api.tracceaqua.com"

export async function POST(req: NextRequest) {
  const body: UserData = await req.json();

  try {
    const response = await axios.post(
      `${process.env.BACKEND_URL_DEV}/api/auth/register`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 201) {
      if (response.status === 400) {
        try {
          const response = await axios.post(
            `${process.env.BACKEND_URL_DEV}/api/auth/login`,
            {
              email: body.email,
              signature: body.signature,
              message: body.message,
              address: body.address,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status !== 200) {
            throw new Error();
          }

          return NextResponse.json({ success: true, data: response.data });
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.error(
              "Axios error:",
              error.response?.data || error.message
            );
            return NextResponse.json({ error: error.message }, { status: 401 });
          }

          console.error("Unexpected error", error);
          return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
          );
        }
      }
      console.log(response.data);
      throw new Error();
    }

    return NextResponse.json({ success: true, data: response.data });
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
