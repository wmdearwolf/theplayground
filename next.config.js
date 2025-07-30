/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
    outputFileTracingRoot: undefined,
  },
  // Disable telemetry
  telemetry: false,
  // Enable SWC minification
  swcMinify: true,
  // Optimize images
  images: {
    domains: [],
    unoptimized: false,
  },
}

module.exports = nextConfig