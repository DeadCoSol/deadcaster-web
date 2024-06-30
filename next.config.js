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
            value: "default-src *; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://deadcaster-web-deadcaster.vercel.app https://*.quiknode.pro https://*.google.com https://*.stripe.com; style-src 'self' 'unsafe-inline' https://deadcaster-web-deadcaster.vercel.app https://*.quiknode.pro https://*.google.com https://*.stripe.com; img-src * 'self' blob: data: https; connect-src 'self' https://api.simplesvg.com https://api.iconify.design https://api.unisvg.com https://firebasestorage.googleapis.com https://deadcaster-web-deadcaster.vercel.app https://stripe.com https://*.jup.ag https://*.audius.co https://*.quiknode.pro https://*.google.com https://*.stripe.com https://firestore.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://identitytoolkit.googleapis.com; frame-src https://localhost https://apis.google.com https://deadcaster.firebaseapp.com https://deadcasterdev.firebaseapp.com https://deadcaster-web-deadcaster.vercel.app https://*.quiknode.pro https://*.google.com https://*.stripe.com; object-src 'none';"
          },
        ],
      },
    ];
  },
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: "/__/auth/:path*",
          destination: `https://deadcasterdev.firebaseapp.com/__/auth/:path*`,
        },
        {
          source: "/__/firebase/:path*",
          destination: `https://deadcasterdev.firebaseapp.com/__/firebase/:path*`,
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
