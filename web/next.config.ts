import type { NextConfig } from "next";

const API = process.env.PF_API_URL ?? "http://localhost:8077";

const nextConfig: NextConfig = {
  output: "standalone",
  // Reading a launch-monitor photo or video makes several vision-model calls and can take over a minute.
  experimental: { proxyTimeout: 180_000 },
  async rewrites() {
    return [{ source: "/api/pf/:path*", destination: `${API}/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self)" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
