/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "127.0.0.1"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-1aa26f93db354c659b0c049a51fe7fbe.r2.dev",
      },
    ],
  },
};

module.exports = nextConfig;
