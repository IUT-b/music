import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb", // Optional: set a limit for request body size
      allowedOrigins: ["http://localhost:3000"], // Optional: restrict origins that can call actions
    },
  },
};

export default nextConfig;
