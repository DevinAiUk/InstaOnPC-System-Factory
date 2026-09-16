import { createAuthClient } from "@neondatabase/auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_NEON_AUTH_URL
});
