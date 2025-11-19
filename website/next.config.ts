import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper file access in serverless environment
  output: 'standalone',
};

export default nextConfig;
