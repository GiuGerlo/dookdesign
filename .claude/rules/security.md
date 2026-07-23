# Seguridad

## Principios obligatorios

1. **Prepared statements siempre.** Cero concatenación de SQL. ORM / Query Builder por default.
2. **CSRF** en todas las mutaciones (POST/PUT/PATCH/DELETE).
3. **Validación en servidor** siempre. La validación cliente es UX, no seguridad.
4. **Escape de salida** automático en templates (Blade `{{ }}`, JSX). Nada de `dangerouslySetInnerHTML` sin sanitización.
5. **Passwords**: hash con `bcrypt` o `argon2id`. Nunca MD5/SHA1.
6. **Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP.
7. **Cookies**: `HttpOnly`, `Secure` (prod), `SameSite=Lax` o `Strict`.
8. **Session regenerate** post-login y post-cambio de password.
9. **Rate limiting** en endpoints sensibles (`login`, `password reset`).
10. **Uploads**: validar mime real con `finfo`, tamaño, dimensiones; nunca confiar en extensión ni en `mime_content_type`.

## `.env` y secretos

- `.env` jamás se commitea. `.env.example` sí (sin valores reales).
- Credenciales rotables al sospechar exposición.
- Para CI/CD: variables en GitHub Actions Secrets o entorno del runner.

## PII

- Datos personales de usuarios/clientes son PII → ningún seed/factory con datos reales en repo. Usar factories.
- Si migrás desde un sistema legacy con passwords MD5/SHA1: al primer login exitoso comparar contra el hash viejo una sola vez, luego rehashear con bcrypt y guardar. O forzar password reset por email.

## Audit checklist (ejecutar al cerrar cada fase)

Skill `/security-review` sobre el branch.

- [ ] Sin secrets en código ni commits.
- [ ] Sin SQL concatenado.
- [ ] Validación server-side en cada endpoint nuevo.
- [ ] Auth + authorization (policies) en cada endpoint nuevo.
- [ ] Rate limit en endpoints públicos sensibles.
- [ ] Headers configurados.
- [ ] Logs no contienen passwords / tokens / PII.
