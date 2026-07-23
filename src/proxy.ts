import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/services-page";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/services", "/services/"],
};
