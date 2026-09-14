import { NextRequest, NextResponse } from "next/server";
export function middleware(req: NextRequest) {
  const password = process.env.FACTORY_ACCESS_PASSWORD;
  if (password) {
    let valid = false;
    try {
      valid =
        atob((req.headers.get("authorization") || "").split(" ")[1] || "") ===
        `operator:${password}`;
    } catch {}
    if (!valid)
      return new NextResponse("Sign in to the private operator workspace.", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="System Factory"' },
      });
  } else if (
    process.env.NODE_ENV === "production" &&
    process.env.FACTORY_LOCAL_ONLY !== "true"
  )
    return new NextResponse(
      "Configure FACTORY_ACCESS_PASSWORD before deploying this operator workspace.",
      { status: 503 },
    );
  if (
    req.nextUrl.pathname.startsWith("/api/") &&
    !["GET", "HEAD"].includes(req.method)
  ) {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.headers.get("host"))
      return NextResponse.json(
        { error: "Cross-origin mutation rejected" },
        { status: 403 },
      );
  }
  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "DENY");
  return res;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
