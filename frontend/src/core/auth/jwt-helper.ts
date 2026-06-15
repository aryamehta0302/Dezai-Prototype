import { SignJWT } from "jose";

/**
 * Sign a lightweight JWT token using AUTH_SECRET (HS256)
 * to be consumed by the NestJS backend.
 */
export async function signBackendToken(payload: {
  id: string;
  email: string;
  role: string;
  onboarded: boolean;
}): Promise<string> {
  const secretString = process.env.AUTH_SECRET;
  if (!secretString) {
    throw new Error("AUTH_SECRET is not configured in environment variables.");
  }

  const secret = new TextEncoder().encode(secretString);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}
