import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@reading/ui", "@reading/epub-utils"]
};

export default nextConfig;
