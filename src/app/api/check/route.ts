import { decryptToken } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token");
  // decode token using decryptToken
  if (!token) return NextResponse.json({ isLoggedIn: false });
  const decoded = await decryptToken(token?.value);
  return NextResponse.json({ isLoggedIn: !!token, decoded });
}
