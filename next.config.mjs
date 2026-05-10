/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "c.saavncdn.com" },
      { protocol: "https", hostname: "**.saavncdn.com" },
      { protocol: "https", hostname: "**.jiosaavn.com" },
    ],
  },
};

export default nextConfig;
