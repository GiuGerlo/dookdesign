-- El bucket 'renders' sirve imágenes públicas del portfolio (galería, hero, previews del admin).
-- Se marca público para que getPublicUrl + CDN funcionen. La subida/edición/borrado siguen
-- restringidos a admin por las policies de storage.objects (0002). Aprobado por el usuario.
update storage.buckets set public = true where id = 'renders';
