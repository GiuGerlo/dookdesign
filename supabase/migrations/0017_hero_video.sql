-- Portada del home: permitir video además de imagen. Path del video en el bucket renders.
alter table site_settings add column if not exists hero_video text;
