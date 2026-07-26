-- Encuadre vertical por render del hero: mapa { "<path>": <0-100> } (% de object-position Y).
-- Keyed por path del render → sobrevive reordenar/borrar. Default {} = todos centrados (50).
alter table public.projects
  add column render_focus jsonb not null default '{}';
