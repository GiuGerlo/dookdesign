create table public.site_settings (
  id           uuid        primary key default gen_random_uuid(),
  about_text   text        not null default '',
  whatsapp_url text,
  email        text,
  updated_at   timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "public read site_settings"
  on public.site_settings for select to anon
  using (true);

create policy "admin update site_settings"
  on public.site_settings for update to authenticated
  using  (auth.jwt() ->> 'email' like '%@dookdesign.com')
  with check (auth.jwt() ->> 'email' like '%@dookdesign.com');

grant all    on public.site_settings to service_role;
grant select on public.site_settings to anon;
grant select, update on public.site_settings to authenticated;

insert into public.site_settings (about_text, whatsapp_url, email)
values ('', null, null);
