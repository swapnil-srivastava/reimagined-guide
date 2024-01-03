/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  i18n: {
    locales: ["en_US", "de_DE", "fr_FR", "hi_IN"],
    defaultLocale: "en_US",
  },
  env: {},
};
module.exports = nextConfig;
