-- El admin (authenticated) necesita SELECT sobre storage.objects del bucket 'renders'.
-- Sin esto, storage.remove() no "ve" el objeto y borra en silencio (no lanza error),
-- dejando archivos huérfanos en el bucket. Mismo patrón que 0005/0007 para tablas.
create policy "admin read renders"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'renders'
    and auth.jwt() ->> 'email' like '%@dookdesign.com'
  );
