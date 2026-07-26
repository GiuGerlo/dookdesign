// Arma los links de contacto (WhatsApp / email) de forma segura.
// El único valor dinámico es el título del proyecto (viene de la DB, no del usuario),
// y todo se pasa por encodeURIComponent → sin riesgo de inyección en el enlace.

/**
 * Construye un deep link de WhatsApp con mensaje pre-cargado.
 * `rawWhatsapp` puede ser un número o una URL (wa.me / api.whatsapp.com): se extraen solo los dígitos.
 * Devuelve `null` si no hay número válido.
 */
export function buildWhatsappUrl(rawWhatsapp: string | null | undefined, title?: string): string | null {
  if (!rawWhatsapp) return null
  const trimmed = rawWhatsapp.trim()
  const digits = trimmed.replace(/\D/g, '')
  const message = title ? `Hola, me interesa ${title}` : 'Hola, quiero hacer una consulta'
  // Número (o link wa.me con número): armamos wa.me con el mensaje pre-cargado del producto.
  if (digits.length >= 8) {
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
  }
  // Link ya armado (ej. wa.link/xxxx): se usa tal cual. No admite inyectar mensaje por producto.
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return null
}

/**
 * Construye un link de redacción de Gmail (web) con destinatario y asunto pre-cargados.
 * Se usa en vez de `mailto:` porque `mailto:` no abre nada si el SO no tiene cliente de
 * correo configurado (típico en Windows). Abrir en pestaña nueva. `null` si no hay email.
 */
export function buildEmailUrl(email: string | null | undefined, title?: string): string | null {
  if (!email) return null
  const subject = title ? `Consulta: ${title}` : 'Consulta desde la web'
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: email, su: subject })
  return `https://mail.google.com/mail/?${params.toString()}`
}
