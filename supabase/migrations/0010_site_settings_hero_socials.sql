-- Portada del hero (path en bucket renders, carpeta site/) + redes sociales del footer.
alter table public.site_settings
  add column if not exists hero_image text,
  add column if not exists instagram_url text,
  add column if not exists behance_url text;
