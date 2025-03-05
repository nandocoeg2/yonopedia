import * as jose from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const alg = "HS256";

export async function createToken(payload: any) {
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  return jwt;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  return token?.value;
}

export async function setToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function removeToken() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}

export async function decryptToken(token: string) {
  const { payload } = await jose.jwtVerify(token, secret);
  return payload;
}
