import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  async redirects() {
    return [
      {
        source: "/merchant",
        destination: "/service-store",
        permanent: false,
      },
      {
        source: "/merchant/:path*",
        destination: "/service-store/:path*",
        permanent: false,
      },
      {
        source: "/admin/merchant-requests",
        destination: "/admin/service-store-requests",
        permanent: false,
      },
      {
        source: "/onboarding/merchant",
        destination: "/service-store/onboarding",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-**",
      },
    ],
  },
}

export default nextConfig
