-- Ubicación del footer (gestionable) + grilla curada del home.
-- home_grid: array ordenado de { "project_id": uuid, "size": "sm"|"wide"|"tall"|"big" }.
alter table public.site_settings
  add column if not exists location text,
  add column if not exists home_grid jsonb not null default '[]';
