/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/articles',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;