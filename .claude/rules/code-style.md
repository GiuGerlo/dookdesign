# Code style

> Dejá solo la sección del stack que uses; borrá la otra o ajustala. `/nuevo-proyecto` no
> reescribe este archivo — revisalo a mano tras el scaffolding.

## Backend (ajustar al lenguaje real)

- Formatter/linter del ecosistema con config versionada (ej. Pint/PSR-12 en PHP, Prettier+ESLint en Node, Black+Ruff en Python).
- snake_case para columnas DB y variables (o la convención del lenguaje).
- Nombres de clases/tipos en PascalCase.
- Validación en la capa de request (Form Requests / DTOs / schemas), no inline en controllers grandes.
- Serializar responses con una capa dedicada (API Resources / serializers). No devolver modelos crudos.
- Migraciones: una intención = una migración. Nombres descriptivos en inglés.

## Frontend (TypeScript / React — ajustar si tu stack difiere)

- Strict mode ON (`tsconfig`).
- camelCase para variables/funciones, PascalCase para componentes y tipos.
- Un componente = un archivo. Export nombrado (no default) salvo páginas de routing.
- Hooks personalizados con prefijo `use*` y un solo propósito.
- Server state → React Query. Client state → `useState`/`useReducer`. Nada de Redux salvo razón fuerte (justificar en ADR).
- Formularios: React Hook Form + resolver Zod. Compartir schemas Zod con backend cuando posible.
- Estilos: Tailwind utilitario; componentes reutilizables en `src/components/ui` y `src/components/<feature>`.
- Accesibilidad: respetar reglas `jsx-a11y`, labels asociados, roles ARIA donde corresponda.

## Convenciones cross

- **Idioma**: identificadores del código en inglés; UI, mensajes al usuario, commits y docs en español.
- Comentarios solo cuando el "por qué" no es obvio. Nada de `// suma a + b`.
- Nada de TODOs sin nombre y fecha: `// TODO(nombre, YYYY-MM): ...`.

## Lo que NO hacemos

- No SQL concatenado, no `md5()` para passwords.
- No `dd()` / `console.log()` en commits.
- No fixtures con datos personales reales — usar factories.
- No CSS inline salvo casos justificados (ej. style en HTML de PDF).
