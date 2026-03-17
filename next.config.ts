import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow .jfif and other formats via unoptimized fallback for local assets
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
};

export default nextConfig;
