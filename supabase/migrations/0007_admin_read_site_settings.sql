-- Faltaba política SELECT para authenticated en site_settings (igual que 0005 para categories).
-- Sin esto, el admin logueado no puede leer la configuración (RLS bloquea authenticated sin policy
-- explícita) y /admin/configuracion falla al hacer .single().
create policy "admin read site_settings"
  on public.site_settings for select to authenticated
  using (auth.jwt() ->> 'email' like '%@dookdesign.com');
