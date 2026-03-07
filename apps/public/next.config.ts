import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@reading/ui", "@reading/epub-utils", "@reading/llm-schemas"]
};

export default nextConfig;
