import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)'])

// export default clerkMiddleware((auth, req) => {
//     if (!isPublicRoute(req)) {
//         auth().protect()
//       }
//     });

// export const config = {
//   matcher: [
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     '/(api|trpc)(.*)',
//   ],
// };

const publicPaths = [
  "/",
  "/auth",
  "/auth/*",
  "/api/auth/*",
];

const protectedPaths = [
  "/dashboard/*",
  "/api/user/*",
];

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;
  // console.log(pathname, 'path')

  const token = await getToken({ req });
  const reqHeaders = new Headers(req.headers);

  if (token) reqHeaders.set("decoded-token", JSON.stringify(token));
  console.log(token, 'token from middleware')

  const isPublicPath = publicPaths.some((path) =>
    path.endsWith('*')
      ? pathname.startsWith(path.slice(0, -2))
      : pathname === path
  );

  const isProtectedPath = protectedPaths.some((path) =>
    path.endsWith('*')
      ? pathname.startsWith(path.slice(0, -2))
      : pathname === path
  );

  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  const setIsolationHeaders = (response) => {
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
    return response;
  };

  if (isPublicPath) {
    if (token && pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    const response = NextResponse.next({
      request: { headers: reqHeaders },
    });
    return setIsolationHeaders(response);
  }

  const response = NextResponse.next({
    request: { headers: reqHeaders },
  });
  return setIsolationHeaders(response);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
