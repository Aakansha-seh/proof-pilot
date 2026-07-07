/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Keep hackathon builds green; lint locally with `npm run lint`.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
