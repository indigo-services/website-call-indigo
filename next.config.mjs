/** @type {import('next').NextConfig} */
const getStrapiApiUrl = () =>
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '').replace(/\/api$/, '');

const staticRedirects = [
  { source: '/book-appointment', destination: '/forms/appointment', permanent: true },
  { source: '/commercial-services', destination: '/forms/commercial', permanent: true },
  { source: '/contact', destination: '/forms/contact', permanent: true },
];

const nextConfig = {
  output: process.env.NEXT_OUTPUT || undefined,
  // Enable Next.js 16 cache components
  cacheComponents: true,
  turbopack: {
    root: process.cwd().replace('/next', ''),
  },
  images: {
    // Disable image optimization for localhost in development
    ...(process.env.NODE_ENV === 'development' ? { unoptimized: true } : {}),
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: process.env.IMAGE_HOSTNAME || 'localhost',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.strapiapp.com',
      },
    ],
  },
  pageExtensions: ['ts', 'tsx'],
  async redirects() {
    const strapiApiUrl = getStrapiApiUrl();

    if (strapiApiUrl === undefined) {
      console.warn(
        '[next.config] NEXT_PUBLIC_API_URL is not defined. Skipping redirect generation.'
      );
      return staticRedirects;
    }

    let redirections = [...staticRedirects];
    try {
      const res = await fetch(`${strapiApiUrl}/api/redirections`);
      const result = await res.json();
      const redirectItems = Array.isArray(result.data)
        ? result.data.map(({ source, destination }) => {
            return {
              source: `/:locale${source}`,
              destination: `/:locale${destination}`,
              permanent: false,
            };
          })
        : [];

      redirections = redirections.concat(redirectItems);

      return redirections;
    } catch (error) {
      // Log warning but don't fail build - redirects are optional
      console.warn(
        '[next.config] Failed to fetch redirects from Strapi:',
        error instanceof Error ? error.message : error
      );
      return [];
    }
  },
};

export default nextConfig;
