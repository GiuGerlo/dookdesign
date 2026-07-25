-- Storage policies para bucket "renders" (ya existe, es público)
-- SELECT anon no necesaria: bucket público sirve URLs por CDN sin RLS

create policy "admin upload renders"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'renders'
    and auth.jwt() ->> 'email' like '%@dookdesign.com'
  );

create policy "admin update renders"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'renders'
    and auth.jwt() ->> 'email' like '%@dookdesign.com'
  )
  with check (
    bucket_id = 'renders'
    and auth.jwt() ->> 'email' like '%@dookdesign.com'
  );

create policy "admin delete renders"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'renders'
    and auth.jwt() ->> 'email' like '%@dookdesign.com'
  );
