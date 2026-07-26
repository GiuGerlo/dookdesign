import type { Metadata } from 'next'
import { DM_Sans, Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { cn } from "@/lib/utils";
import { siteUrl, SITE_NAME, AUTHOR, LOCALE, SITE_DESCRIPTION } from '@/lib/site/seo'

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const dmSans = DM_Sans({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — Diseño industrial de ${AUTHOR}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR }],
  creator: AUTHOR,
  keywords: [
    'diseño industrial',
    'diseñador industrial',
    'mobiliario',
    'diseño de producto',
    'renders 3D',
    'Agustín Cavallera',
    'DooK Design',
    'Rosario',
    'Argentina',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: LOCALE,
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Diseño industrial de ${AUTHOR}`,
    description: SITE_DESCRIPTION,
    images: [{ url: '/opengraph.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Diseño industrial de ${AUTHOR}`,
    description: SITE_DESCRIPTION,
    images: ['/opengraph.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        {/* Evita flash de tema incorrecto al cargar. Default: oscuro. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('theme');if(t!=='light')document.documentElement.setAttribute('data-theme','dark')}catch{}`,
          }}
        />
      </head>
      {/* suppressHydrationWarning: extensiones del navegador (ej. ColorZilla) inyectan attrs en el body */}
      <body className={dmSans.variable} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
