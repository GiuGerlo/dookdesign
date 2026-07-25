-- Faltaba política SELECT para authenticated en categories.
-- Sin esto, el admin logueado no puede leer la lista de categorías (RLS bloquea authenticated sin policy explícita).
create policy "admin read categories"
  on public.categories for select to authenticated
  using (auth.jwt() ->> 'email' like '%@dookdesign.com');
