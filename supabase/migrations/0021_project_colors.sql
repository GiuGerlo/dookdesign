-- Colores por proyecto: variantes de color de la pieza, cada una asociada a un render.
-- Forma de cada color: { "hex": "#RRGGBB", "name": "Verde oliva", "render": "<path>" }
-- donde `render` es un path presente en projects.renders. Orden = orden del array.
-- Aditiva con default '[]': proyectos existentes quedan sin colores hasta que se carguen.
alter table public.projects
  add column colors jsonb not null default '[]'::jsonb;
