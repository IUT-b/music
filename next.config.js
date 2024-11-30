/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb", // Optional: set a limit for request body size
      allowedOrigins: ["http://localhost:3000"], // Optional: restrict origins that can call actions
    },
  },
};

module.exports = nextConfig;
