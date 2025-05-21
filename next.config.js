/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Update the basePath to match the actual GitHub Pages repository name
  basePath: process.env.NODE_ENV === 'production' ? '/arxiv-paper-finder' : '',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  distDir: 'out',
  trailingSlash: true,
};

module.exports = nextConfig; 