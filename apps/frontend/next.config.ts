import type { NextConfig } from "next";

// Log environment variables during build (for debugging)
console.log('Build-time env check:');
console.log('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'EXISTS' : 'MISSING');

const nextConfig: NextConfig = {
  /* config options here */
  // Explicitly expose the Clerk publishable key for build time
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  },
};

export default nextConfig;
