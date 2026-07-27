import Image from 'next/image'
import { MessageCircle, Mail, MapPin, ExternalLink, type LucideIcon } from 'lucide-react'
import { buildWhatsappUrl, buildEmailUrl } from '@/lib/site/contact'
import { AR } from 'country-flag-icons/react/3x2'
import type { Tables } from '@/types/database'

// lucide-react ya no incluye logos de marca (Instagram, etc.) → SVG inline estilo outline.
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

const socialIcon: Record<string, LucideIcon> = {
  Instagram: InstagramIcon as LucideIcon,
  Behance: ExternalLink,
}

interface SiteFooterProps {
  settings: Tables<'site_settings'> | null
  mini?: boolean
}

function DevCredit() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[11px] uppercase tracking-[0.08em] text-(--text-secondary)">
        Desarrollado por
      </span>
      <a
        href="https://giulianogerlo.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Desarrollado por Giuliano Gerlo"
        className="relative block h-4 w-[67px] opacity-100 transition-opacity duration-300 hover:opacity-60"
      >
        <Image src="/logo-gg-sec.svg" alt="" fill sizes="67px" className="gg-for-light object-contain transition-opacity duration-300" />
        <Image src="/logo-gg.svg" alt="" fill sizes="67px" className="gg-for-dark object-contain transition-opacity duration-300" />
      </a>
    </div>
  )
}

// Footer del sitio. `mini`: solo la barra final (página de detalle).
export function SiteFooter({ settings, mini = false }: SiteFooterProps) {
  const waUrl = buildWhatsappUrl(settings?.whatsapp_url)
  const emailUrl = buildEmailUrl(settings?.email)
  const socials = [
    { label: 'dookdesign__', href: settings?.instagram_url },
    { label: 'Behance', href: settings?.behance_url },
  ].filter((s): s is { label: string; href: string } => !!s.href)

  const bottomBar = (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-(--site-border) pt-7">
      <span className="text-[11px] uppercase tracking-[0.08em] text-(--text-secondary)">© 2026 DooK Design</span>
      <DevCredit />
    </div>
  )

  if (mini) {
    return (
      <footer className="mx-auto max-w-[1600px] px-5 pb-10 pt-8 md:px-16 md:pb-12">
        {bottomBar}
      </footer>
    )
  }

  return (
    <footer id="contacto">
      <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-16 md:py-12">
        {/* Envíos a todo el país */}
        <div className="flex flex-wrap items-center justify-center gap-4 border-t border-(--site-border) pt-14 pb-14 text-center md:gap-6">
          <p className="text-[clamp(32px,5vw,64px)] font-bold leading-[1.02] tracking-[-0.03em]">
            Envíos a todo el país
          </p>
          <AR title="Argentina" className="h-9 w-[54px] shrink-0 overflow-hidden rounded-md shadow-sm md:h-11 md:w-[66px]" />
        </div>
        {/* CTA */}
        <div className="flex flex-wrap items-end justify-between gap-7 border-t border-(--site-border) pt-14 pb-14">
          <p className="max-w-[720px] text-[clamp(32px,5vw,64px)] font-bold leading-[1.02] tracking-[-0.03em]">
            ¿Tenés un proyecto
            <br />
            en mente?
          </p>
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-invert whitespace-nowrap rounded-full px-8 py-3.5 text-sm font-semibold"
            >
              Escribime →
            </a>
          )}
        </div>

        {/* Columnas */}
        <div className="flex flex-wrap items-start justify-between gap-8 border-t border-(--site-border) py-10">
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] uppercase tracking-[0.14em] text-(--text-secondary)">Contacto</span>
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-[15px] font-medium hover:text-(--brand-ink)">
                <MessageCircle className="h-[18px] w-[18px] text-(--text-secondary)" aria-hidden />
                WhatsApp
              </a>
            )}
            {emailUrl && settings?.email && (
              <a href={emailUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-[15px] font-medium hover:text-(--brand-ink)">
                <Mail className="h-[18px] w-[18px] text-(--text-secondary)" aria-hidden />
                {settings.email}
              </a>
            )}
          </div>
          {socials.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] uppercase tracking-[0.14em] text-(--text-secondary)">Redes</span>
              {socials.map(s => {
                const Icon = socialIcon[s.label] ?? ExternalLink
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-[15px] font-medium hover:text-(--brand-ink)"
                  >
                    <Icon className="h-[18px] w-[18px] text-(--text-secondary)" aria-hidden />
                    {s.label}
                  </a>
                )
              })}
            </div>
          )}
          {settings?.location && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] uppercase tracking-[0.14em] text-(--text-secondary)">Ubicación</span>
              <span className="flex items-center gap-2.5 text-[15px] font-medium">
                <MapPin className="h-[18px] w-[18px] text-(--text-secondary)" aria-hidden />
                {settings.location}
              </span>
            </div>
          )}
        </div>

        {bottomBar}
      </div>
    </footer>
  )
}
