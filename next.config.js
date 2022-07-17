/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  env: {
    TWILIO_ACCOUNT_SID : "ACaab467cfee563421ed66bdec52b27698",
    TWILIO_AUTH_TOKEN : "2b6791369810873238e661fd101dd23b",
    SWAPNIL_UID: "WYrropAdLKWaNdQDtkl64Anuthf2"
  },
}
module.exports = nextConfig
