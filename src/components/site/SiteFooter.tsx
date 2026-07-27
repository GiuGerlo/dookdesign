import Image from 'next/image'
import { Mail, MapPin, ExternalLink, type LucideIcon } from 'lucide-react'
import { buildWhatsappUrl, buildEmailUrl } from '@/lib/site/contact'
import { AR } from 'country-flag-icons/react/3x2'
import type { Tables } from '@/types/database'

// lucide-react ya no incluye logos de marca → SVG de marca inline (fill currentColor).
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function WhatsappIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

const socialIcon: Record<string, LucideIcon> = {
  dookdesign__: InstagramIcon as LucideIcon,
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
                <WhatsappIcon className="h-[18px] w-[18px] text-(--text-secondary)" aria-hidden />
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
