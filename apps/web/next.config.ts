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
        destination: "/app",
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
      {
        source: "/app/waiting",
        destination: "/app",
        permanent: false,
      },
      {
        source: "/sign-in",
        destination: "/app/login",
        permanent: false,
      },
      {
        source: "/claim",
        destination: "/app?mode=claim",
        permanent: false,
      },
      {
        source: "/create-store",
        destination: "/app?mode=create",
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
