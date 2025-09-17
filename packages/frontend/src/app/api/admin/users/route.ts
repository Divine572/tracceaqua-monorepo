import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function GET(req: NextRequest) {
  
  const cookieStore = cookies();
  const userToken = (await cookieStore).get("user-token")?.value;

  const {searchParams} = new URL(req.url)
  const search = searchParams.get("search")
  const role = searchParams.get("role")
  const status = searchParams.get("status")

  try {
    const response = await axios.get(
      `${process.env.BACKEND_URL_DEV}/admin/users`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`
        },
        params: {
          search,
          role,
          status
        }
      }
    );

    if (response.status !== 200) {
      console.log(response.data);
      throw new Error();
    }

    return NextResponse.json({ success: true, data: response.data.data.data });
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