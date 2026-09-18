import { createNeonAuth } from "@neondatabase/auth/next/server";

if (!process.env.NEON_AUTH_SECRET) {
  throw new Error("FATAL: NEON_AUTH_SECRET environment variable is not set.");
}

export const auth = createNeonAuth({
  baseUrl: process.env.NEXT_PUBLIC_NEON_AUTH_URL,
  cookies: {
    secret: process.env.NEON_AUTH_SECRET
  }
});
