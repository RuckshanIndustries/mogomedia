/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Explicitly set for static site generation
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Required for static exports if images are used
  },
};

export default nextConfig;
