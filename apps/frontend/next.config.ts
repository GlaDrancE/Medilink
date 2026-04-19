import type { NextConfig } from "next";

console.log('Build-time env check:');
console.log('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'EXISTS' : 'MISSING');

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  },
  async headers() {
    return [
      {
        source: '/:path*.mp4',
        headers: [
          { key: 'Accept-Ranges', value: 'bytes' },
        ],
      },
    ];
  },
};

export default nextConfig;
