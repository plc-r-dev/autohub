import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@workspace/ui",
    "@mui/material",
    "@mui/material-nextjs",
    "@mui/icons-material",
    "@mui/system",
    "@mui/utils",
    "@emotion/react",
    "@emotion/styled",
    "@emotion/cache",
  ],
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
        destination: "/admin/service-stores/claims",
        permanent: false,
      },
      {
        source: "/admin/service-store-requests",
        destination: "/admin/service-stores/claims",
        permanent: false,
      },
      {
        source: "/admin/jobs",
        destination: "/admin/settings/scheduler",
        permanent: false,
      },
      {
        source: "/admin/jobs/:path*",
        destination: "/admin/settings/scheduler/:path*",
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
        destination: "/",
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
