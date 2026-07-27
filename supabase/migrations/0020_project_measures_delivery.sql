-- Medidas físicas (cm) y tiempo de entrega estimada (días) por proyecto.
-- Aditiva y nullable: proyectos existentes quedan sin datos hasta que se carguen.
alter table public.projects
  add column width_cm      integer,
  add column length_cm     integer,
  add column height_cm     integer,
  add column delivery_days integer;
