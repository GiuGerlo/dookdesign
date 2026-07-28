// Arma los links de contacto (WhatsApp / email) de forma segura.
// El único valor dinámico es el título del proyecto (viene de la DB, no del usuario),
// y todo se pasa por encodeURIComponent → sin riesgo de inyección en el enlace.

import type { CartItem } from '@/lib/site/cart'

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
 * Construye el deep link de WhatsApp del pedido de presupuesto (carrito completo).
 * Lista producto/color/cantidad + lugar de envío. `location` lo escribe el visitante →
 * se pasa por encodeURIComponent junto con todo el mensaje. Devuelve `null` si no hay
 * número válido o el carrito está vacío (el botón queda deshabilitado).
 */
export function buildCartWhatsappUrl(
  rawWhatsapp: string | null | undefined,
  items: CartItem[],
  fullName: string,
  location: string,
): string | null {
  if (!rawWhatsapp || items.length === 0) return null
  const digits = rawWhatsapp.trim().replace(/\D/g, '')
  if (digits.length < 8) return null

  const lines = items.map(i => {
    const color = i.colorName ? ` — Color: ${i.colorName}` : ''
    return `• ${i.title}${color} — Cantidad: ${i.quantity}`
  })
  const message = [
    `¡Hola Agustín! Soy ${fullName.trim()}. Quiero pedir un presupuesto:`,
    '',
    ...lines,
    '',
    `Enviar a: ${location.trim()}`,
  ].join('\n')

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
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
