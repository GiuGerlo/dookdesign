-- Renders de entorno: imágenes de contexto (máx 3, webp), fila fija sin zoom en el detalle.
-- No van a la galería principal. Mismo bucket `renders` y policies existentes.
alter table public.projects
  add column environment_renders text[] not null default '{}';
