import type { NextConfig } from 'next'

// CSP: Next App Router inyecta scripts inline (bootstrap/hydration) y el script anti-flash de tema
// vive inline en layout.tsx → script-src necesita 'unsafe-inline'. XSS mitigado por escape de JSX y
// cero dangerouslySetInnerHTML con datos de usuario.
// ponytail: upgrade a CSP con nonce vía proxy si el modelo de amenaza lo exige.
const csp = [
  "default-src 'self'",
  "img-src 'self' https://*.supabase.co data: blob:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://*.supabase.co",
  "font-src 'self' data:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  // sharp se usa en la route OG (server). No bundlearla — se resuelve como binario nativo.
  serverExternalPackages: ['sharp'],
  // El file-tracing de Next no arrastra el binario nativo de libvips (dep de sharp) a la lambda
  // → en Vercel (linux) sharp fallaba con "libvips-cpp.so ... No such file". Forzamos su inclusión.
  outputFileTracingIncludes: {
    '/proyectos/[slug]/og': [
      './node_modules/.pnpm/@img+sharp-linux-x64@*/**',
      './node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/**',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
