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
            value: "default-src *; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://deadcaster-web-deadcaster.vercel.app https://*.quiknode.pro https://*.google.com https://*.stripe.com; style-src 'self' 'unsafe-inline' https://deadcaster-web-deadcaster.vercel.app https://*.quiknode.pro https://*.google.com https://*.stripe.com; img-src 'self' data: https://deadcaster-web-deadcaster.vercel.app https://*.iconify.design https://*.simplesvg.com https://*.unisvg.com https://arweave.net https://*.arweave.net https://*.quiknode.pro https://*.google.com https://*.stripe.com https://*.deadcaster.xyz https://firebasestorage.googleapis.com https://lh3.googleusercontent.com; connect-src 'self' https://deadcaster-web-deadcaster.vercel.app https://stripe.com https://*.jup.ag https://*.audius.co https://*.quiknode.pro https://*.google.com https://*.stripe.com https://firestore.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://identitytoolkit.googleapis.com; frame-src https://deadcaster-web-deadcaster.vercel.app https://*.quiknode.pro https://*.google.com https://*.stripe.com; object-src 'none';"
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
