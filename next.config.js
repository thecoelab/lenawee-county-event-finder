/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    // Include neo4j-driver in standalone output
    serverComponentsExternalPackages: ['neo4j-driver']
  }
}

module.exports = nextConfig