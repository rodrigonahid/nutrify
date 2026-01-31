import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const { user } = await getSession();

    if (!user) {
      const response = NextResponse.json({ user: null }, { status: 401 });
      // Clear stale session cookie if it exists but the session is invalid
      response.cookies.delete("session");
      return response;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
