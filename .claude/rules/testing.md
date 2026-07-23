# Testing

> Stack: Next.js 16 / React / TypeScript. Runner sugerido cuando haga falta: Vitest + Testing Library.

## Estructura sugerida

- `tests/Unit/` (o equivalente) — sin DB, sin HTTP. Lógica pura.
- `tests/Feature/` (o `integration/`) — con DB/HTTP, flujos reales.
- DB de tests aislada (in-memory o base dedicada). Nunca la de desarrollo.
- Factories/fixtures para todo modelo. Seeders solo para datos demo, no para tests.
- Coverage objetivo: features críticos ≥ 80%. No perseguir 100% global.

## Frontend

- Runner + Testing Library + mock de red (MSW o equivalente) para mockear API.
- Tests unitarios para hooks y utils puros.
- Tests de integración para flujos (login, crear X, generar PDF...).
- No tests de implementación interna (no testar estado de componentes vía `instance`).

## Comandos

```
n/a     # backend  (sin runner aún; agregar Vitest si aparece lógica no trivial)
n/a     # frontend  (Vitest + Testing Library cuando haya componentes con lógica)
```

> Proyecto arranca sin suite de tests (portfolio, poca lógica). Verificación = `pnpm build` + QA manual en el navegador. Agregar tests recién cuando haya lógica que lo justifique (transforms de datos, flujos de carga).

## Cuándo correr

- **Localmente** antes de cerrar fase.
- **CI** en cada push.
- Si un test falla en CI, no se mergea. Punto.

## Verificación manual (handoff al usuario) — OBLIGATORIO antes del commit

Los tests automáticos NO alcanzan: validan contratos/bytes, no que la cosa se vea/funcione bien
(ej.: un test de PDF chequea `%PDF`, no el layout). **Antes de sugerir el mensaje de commit, el agente
SIEMPRE entrega al usuario una guía de QA manual** para que pruebe él mismo. El commit lo hace el usuario
recién después de mirar con sus ojos.

La guía debe tener:
1. **Cómo levantar/llegar** — comando y URL exactos.
2. **Qué hacer** — pasos concretos, click por click, con datos de ejemplo si hace falta.
3. **Qué tenés que ver** — el resultado esperado, ítem por ítem (lo que confirma que está OK).
4. **Señales de que está mal** — qué significaría que algo se rompió.

Recién **después** de esta guía va el mensaje de commit sugerido. Nunca al revés, nunca sin la guía.
