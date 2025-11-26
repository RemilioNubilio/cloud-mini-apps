/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile shared packages
  transpilePackages: ["@repo/ui"],

  // For production builds
  output: "standalone",

  // Image domains for external images
  images: {
    domains: ["images.unsplash.com", "pbs.twimg.com", "instagram.com"],
  },

  // Disable ESLint during builds (errors won't block deployment)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
