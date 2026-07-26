import type { Metadata } from 'next'
import { DM_Sans, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const dmSans = DM_Sans({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DooK Design',
  description: 'Portfolio de Agustín Cavallera — Diseñador Industrial',
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
      <body className={dmSans.variable}>
        {children}
      </body>
    </html>
  )
}
