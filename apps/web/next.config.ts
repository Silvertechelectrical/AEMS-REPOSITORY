import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
const normalizedBasePath = basePath && basePath !== '/' ? basePath : '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  output: 'export',
  trailingSlash: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    unoptimized: true,
  },
  ...(normalizedBasePath
    ? {
        basePath: normalizedBasePath,
        assetPrefix: `${normalizedBasePath}/`,
      }
    : {}),
};

export default nextConfig;
