import { NextResponse, type NextRequest } from "next/server";

/** `/` → `/de` or `/en`, based on the visitor's Accept-Language. */
export function proxy(request: NextRequest) {
  const accept = request.headers.get("accept-language") ?? "";
  const prefersGerman = /^\s*de\b/i.test(accept) || (/\bde\b/i.test(accept) && !/^\s*en\b/i.test(accept));
  const url = request.nextUrl.clone();
  url.pathname = prefersGerman ? "/de" : "/en";
  return NextResponse.redirect(url);
}

export const config = { matcher: "/" };
