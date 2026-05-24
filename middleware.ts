import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default intlMiddleware;

export const config = {
  // Match all pathnames except static assets, api routes, and admin
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|logo|.*\\..*).*)',
    '/admin/:path*',
  ],
};
