import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@reading/ui', '@reading/llm-schemas'],
  serverExternalPackages: [
    '@storyteller-platform/epub',
    'yauzl-promise',
    '@node-rs/crc32',
  ],
};

export default nextConfig;
