/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  i18n: {
    locales: ["en-US", "de-DE", "fr-FR", "hi-IN"],
    defaultLocale: "en-US",
  },
  env: {
    TWILIO_ACCOUNT_SID: "ACaab467cfee563421ed66bdec52b27698",
    TWILIO_AUTH_TOKEN: "2b6791369810873238e661fd101dd23b",
    SWAPNIL_UID: "WYrropAdLKWaNdQDtkl64Anuthf2",
    SWAPNIL_ID: "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
  },
};
module.exports = nextConfig;
