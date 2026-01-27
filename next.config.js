/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,

  // Environment variables available to the browser
  env: {
    MEDIUM_USERNAME: process.env.MEDIUM_USERNAME || 'rudratech',
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'miro.medium.com',
      },
      {
        protocol: 'https',
        hostname: '*.blogspot.com',
      },
    ],
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          // Disable edge caching for API routes to ensure fresh RSS data
          // The API handles its own in-memory caching with shorter TTL
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
