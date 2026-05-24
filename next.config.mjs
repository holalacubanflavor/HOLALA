import createNextIntlPlugin from 'next-intl/plugin';

// ── Workaround for corporate proxy SSL inspection ──────────────────────────
// Only applies to local development builds. Vercel builds are unaffected.
if (process.env.NODE_ENV !== 'production' || process.env.LOCAL_BUILD === '1') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Webpack: suppress errors for optional packages not yet installed
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
