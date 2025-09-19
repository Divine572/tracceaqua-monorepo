import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

// const baseUrl = "https://api.tracceaqua.com"

export async function POST(req: NextRequest) {
  const body = await req.json();

  const cookieStore = cookies();

  const userToken = (await cookieStore).get("user-token")?.value;

  const {searchParams} = new URL(req.url)
  const productId = searchParams.get("productId")

//   console.log(process.env.BACKEND_URL_DEV)

  try {
    const response = await axios.post(
      `/api/supply-chain/public`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`
        },
        params: {
          productId
        }
      }
    );

    if (response.status !== 201) {
      console.log(response.data);
      throw new Error();
    }

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