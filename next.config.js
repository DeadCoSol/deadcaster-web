/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src *; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.quiknode.pro https://*.google.com https://*.stripe.com; style-src 'self' 'unsafe-inline' https://*.quiknode.pro https://*.google.com https://*.stripe.com; img-src 'self' data: https://*.iconify.design https://*.simplesvg.com https://*.unisvg.com https://arweave.net https://*.arweave.net https://*.quiknode.pro https://*.google.com https://*.stripe.com https://*.deadcaster.xyz https://firebasestorage.googleapis.com https://lh3.googleusercontent.com; connect-src 'self' https://stripe.com https://*.jup.ag https://*.audius.co https://*.quiknode.pro https://*.google.com https://*.stripe.com https://firestore.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://identitytoolkit.googleapis.com; frame-src https://*.quiknode.pro https://*.google.com https://*.stripe.com; object-src 'none';"
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
