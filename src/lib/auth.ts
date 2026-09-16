import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEXT_PUBLIC_NEON_AUTH_URL,
  cookies: {
    secret: process.env.NEON_AUTH_SECRET || "fallback-secret-minimum-32-chars-long-here"
  }
});
