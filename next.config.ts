import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'funiture-shop-storage.s3.ap-southeast-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;