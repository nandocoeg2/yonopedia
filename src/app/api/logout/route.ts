import { removeToken } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await removeToken();
  return NextResponse.redirect(new URL("/login", request.url));
}
