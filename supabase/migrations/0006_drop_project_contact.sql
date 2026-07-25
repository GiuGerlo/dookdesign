-- Contacto pasa a ser global (site_settings). Se eliminan los campos de contacto
-- por proyecto, que quedaban redundantes: el dueño es el mismo para todos los diseños.
-- Ver docs/adr/0001-contacto-global-desde-site-settings.md
alter table public.projects
  drop column if exists whatsapp_url,
  drop column if exists email;
