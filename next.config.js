/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Optimize for Vercel deployment
  output: 'standalone'
}

module.exports = nextConfig