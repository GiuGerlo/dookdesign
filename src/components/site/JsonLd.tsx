// Inyecta datos estructurados JSON-LD. CSP permite script inline (script-src 'unsafe-inline').
// El objeto no contiene datos del usuario que puedan romper el </script> (títulos ya escapados).
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
