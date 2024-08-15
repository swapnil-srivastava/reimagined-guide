/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com", "dbydvpdhbaqudqqjteoq.supabase.co"],
  },
  i18n: {
    locales: ["en-US", "de-DE", "fr-FR", "hi-IN"],
    defaultLocale: "en-US",
  },
  env: {},
};
module.exports = nextConfig;
