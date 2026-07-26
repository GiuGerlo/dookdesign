-- Página pública /proyectos editable desde admin: texto de intro + grilla libre (orden/tamaño/recorte).
alter table site_settings add column if not exists projects_intro text;
alter table site_settings add column if not exists projects_grid jsonb not null default '[]'::jsonb;
