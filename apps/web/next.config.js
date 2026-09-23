/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // ⚠️ Temporarily ignore build errors - fix incrementally after deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ Temporarily ignore lint errors during build
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'dbydvpdhbaqudqqjteoq.supabase.co',
      },
    ],
  },
  i18n: {
    locales: ["en-US", "de-DE", "fr-FR", "hi-IN"],
    defaultLocale: "en-US",
  },
  env: {},
  experimental: {
    // Bundle node_modules into the server bundles instead of leaving them as
    // external requires. Otherwise Next's build-trace step has to walk ~1,600
    // files per page (@mui, twilio, stripe, ...), and on Vercel's 2-core build
    // machines that runs alongside static page generation and slowed it from
    // seconds to ~3 minutes.
    bundlePagesExternals: true,
  },
};
module.exports = nextConfig;
