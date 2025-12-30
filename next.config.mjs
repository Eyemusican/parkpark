/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // TypeScript checking (set to true to skip errors during build)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Allow external images from backend
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_API_HOST || 'localhost',
        port: process.env.NEXT_PUBLIC_API_PORT || '5000',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
