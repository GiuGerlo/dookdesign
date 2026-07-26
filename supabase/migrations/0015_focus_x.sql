-- Encuadre horizontal (object-position X, 0-100; default 50 = centro).
-- Paridad con el eje Y: hero_focus (portada) y render_focus (hero de proyecto).
alter table public.site_settings
  add column hero_focus_x smallint not null default 50;

alter table public.projects
  add column render_focus_x jsonb not null default '{}';
