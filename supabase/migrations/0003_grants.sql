-- Grants explícitos por rol
-- Necesario cuando las migraciones se aplican con un rol no-postgres
-- (el owner puede no ser el rol que ejecuta, y los default privileges no se aplican)

grant all    on public.categories to service_role;
grant select, insert, update, delete on public.categories to authenticated;
grant select on public.categories to anon;

grant all    on public.projects to service_role;
grant select, insert, update, delete on public.projects to authenticated;
grant select on public.projects to anon;
