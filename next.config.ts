import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // domains: ['fakestoreapi.com'],
    remotePatterns: [
      {
        pathname: "**",
        hostname: "fakestoreapi.com",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
