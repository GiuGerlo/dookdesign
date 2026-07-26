# Setup manual — pasos que hace Giuliano (no el agente)

> Todo lo que requiere tu mano: crear cuentas, proyectos, pegar claves. El agente NO puede hacer esto.
> Marcá con [x] a medida que avances. Orden recomendado de arriba hacia abajo.

## 0. Requisitos locales

- [X] Node 24 LTS instalado (`node -v`).
- [X] pnpm instalado (`pnpm -v`). Si no: `npm i -g pnpm` (única vez que se toca npm, para instalar pnpm).

## 1. Supabase (DB + Storage + Auth) — free tier

- [X] Entrar a https://supabase.com → New project. Nombre: `dookdesign`. Region: la más cercana (South America / Brazil). Guardar la **DB password**.
- [X] Project Settings → **API**: copiar `Project URL`, `anon public key`, `service_role key`.
- [X] Storage → New bucket: `renders`, **Public** (para servir imágenes). Repetir con `thumbnails` si querés versiones chicas.
- [X] Más adelante (fase admin): Authentication → Users → Add user → crear usuario de Agustín:
  - Email: `CODIGO@dookdesign.com` (CODIGO = número de 4 dígitos que elija Agustín, ej. `1234@dookdesign.com`)
  - Password: su contraseña (máx. 16 caracteres)
  - El login del admin muestra "Código" y "Contraseña" — el frontend mapea `código + "@dookdesign.com"` como email para Supabase Auth. Un único usuario, sin tabla custom.

## 2. Repo en GitHub (para deploy automático)

- [X] Crear repo `dookdesign` en GitHub (privado).
- [X] Conectar el repo local: el agente deja el `git init` hecho; vos hacés el primer commit y `git remote add origin ...` + push cuando quieras.

## 3. Vercel (deploy) — misma cuenta que giulianogerlo, free

- [X] https://vercel.com → Add New → Project → importar el repo `dookdesign`. Framework: **Next.js** (autodetecta).
- [x] En el import, sección **Environment Variables**, cargar (ver paso 4).
- [x] Deploy. Queda en `dookdesign.vercel.app` (gratis).

## 4. Variables de entorno

Copiar `.env.example` → `.env.local` y rellenar con las claves de Supabase (paso 1):

- [x] `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
- [x] `SUPABASE_SERVICE_ROLE_KEY` = service_role key (⚠️ NUNCA al cliente, solo server)

Las mismas tres van cargadas también en **Vercel → Project → Settings → Environment Variables** (Production + Preview).

- [x] `.env.local` cargado local.
- [x] Las 3 vars cargadas en Vercel.

## 5. Supabase MCP (opcional, para que el agente maneje el schema)

- [x] Instalar el Supabase MCP (lo ofreciste). Cuando lo instales se crea/edita `.mcp.json` en el proyecto. Sirve para que el agente cree tablas y consulte la DB directo.

## 6. Dominio (SOLO al lanzar, no ahora)

- [ ] Comprar `dookdesign.com` (~USD 11/año) en Cloudflare Registrar (al costo) o Vercel (cómodo).
- [ ] Vercel → Project → Settings → Domains → agregar `dookdesign.com` y seguir los DNS que indica.

---

**Estado (2026-07-23):** Supabase creado + claves copiadas + buckets creados + MCP conectado. Pendiente: Auth provider Email, GitHub repo, Vercel deploy, `.env.local`.
