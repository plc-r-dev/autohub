import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  async redirects() {
    return [
      {
        source: "/merchant",
        destination: "/app",
        permanent: false,
      },
      {
        source: "/merchant/:path*",
        destination: "/app/:path*",
        permanent: false,
      },
      {
        source: "/admin/merchant-requests",
        destination: "/admin/service-store-requests",
        permanent: false,
      },
      {
        source: "/onboarding/merchant",
        destination: "/app/onboarding",
        permanent: false,
      },
      {
        source: "/service-store",
        destination: "/app",
        permanent: false,
      },
      {
        source: "/service-store/:path*",
        destination: "/app/:path*",
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
