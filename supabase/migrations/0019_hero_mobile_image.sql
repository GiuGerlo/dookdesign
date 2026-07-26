-- Portada del home: imagen separada para móvil (+ su encuadre). Se abandona el video (el código
-- ya no usa hero_video; la columna queda muerta y se puede dropear a mano cuando se confirme).
alter table site_settings add column if not exists hero_image_mobile text;
alter table site_settings add column if not exists hero_focus_mobile smallint not null default 50;
alter table site_settings add column if not exists hero_focus_x_mobile smallint not null default 50;
