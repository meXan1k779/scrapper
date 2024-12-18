import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: 'build',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/scrapper/' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/scrapper' : '',
  trailingSlash: true,
};

export default nextConfig;
