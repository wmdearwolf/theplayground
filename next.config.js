/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  // Enable SWC minification
  swcMinify: true,
  // Optimize images
  images: {
    domains: [],
    unoptimized: false,
  },
  // Webpack configuration to handle optional dependencies
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bufferutil: false,
        'utf-8-validate': false,
      }
    }
    return config
  },
}

module.exports = nextConfig