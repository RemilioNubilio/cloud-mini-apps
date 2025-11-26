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
};

export default nextConfig;
