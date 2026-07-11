/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle (.next/standalone) for a small Docker image.
  output: "standalone",
  eslint: {
    // Keep hackathon builds green; lint locally with `npm run lint`.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
