/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.dbdb-team.site/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
