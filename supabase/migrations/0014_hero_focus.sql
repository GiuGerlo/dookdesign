-- Encuadre vertical de la portada del home (object-position Y, 0-100; default 50 = centro).
alter table public.site_settings
  add column hero_focus smallint not null default 50;
