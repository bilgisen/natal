import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
  },
  images: {
    qualities: [75, 85, 90, 95, 100],
  },
  webpack: (config, { isServer }) => {
    // Exclude ioredis from client-side bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        net: false,
        tls: false,
        fs: false,
        ioredis: false,
      };
    }
    return config;
  },
};

export default nextConfig;
