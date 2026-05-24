import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin route guard ───────────────────────────────────────────────────────
  // Check Supabase session for any /admin/* path.
  // Redirects unauthenticated users to /admin/login.
  if (pathname.startsWith('/admin')) {
    // Skip the login page itself to avoid redirect loop
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If Supabase is not yet configured (dev/staging without env vars),
    // allow access so the skeleton UI is still viewable during development.
    // IMPORTANT: Remove this bypass before launch or once env vars are set.
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.next();
    }

    const response = NextResponse.next();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // ── i18n middleware for all other routes ────────────────────────────────────
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Skip static assets and api routes for i18n middleware.
    // Admin routes are handled above before reaching intlMiddleware.
    '/((?!api|_next/static|_next/image|favicon\\.ico|logo|.*\\..*).*)',
    '/admin/:path*',
  ],
};
