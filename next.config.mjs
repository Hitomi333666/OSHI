/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.microcms-assets.io",
        pathname: "/**", // 任意のパスを許可
      },
      {
        protocol: "https",
        hostname: "img.daisyui.com",
        pathname: "/images/stock/**", // DaisyUIの画像を許可
      },
    ],
  },
};

export default nextConfig;
