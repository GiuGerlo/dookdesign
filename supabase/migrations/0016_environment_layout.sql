-- Layout de renders de entorno: por path, la forma de celda + encuadre X/Y.
-- Mapa jsonb { "<path>": { "size": "horizontal"|"vertical"|"cuadrada"|"panoramica", "focus": 0-100, "focus_x": 0-100 } }.
-- Ausencia = celda 4:3 centrada (comportamiento previo).
alter table public.projects
  add column environment_layout jsonb not null default '{}';
