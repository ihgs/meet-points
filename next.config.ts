import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is already in Next.js's automatic serverExternalPackages list,
  // but listed explicitly for clarity
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
