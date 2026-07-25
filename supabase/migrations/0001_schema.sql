-- categories
create table public.categories (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  slug       text        not null unique,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "public read categories"
  on public.categories for select to anon
  using (true);

create policy "admin insert categories"
  on public.categories for insert to authenticated
  with check (auth.jwt() ->> 'email' like '%@dookdesign.com');

create policy "admin update categories"
  on public.categories for update to authenticated
  using  (auth.jwt() ->> 'email' like '%@dookdesign.com')
  with check (auth.jwt() ->> 'email' like '%@dookdesign.com');

create policy "admin delete categories"
  on public.categories for delete to authenticated
  using (auth.jwt() ->> 'email' like '%@dookdesign.com');

-- projects
create table public.projects (
  id           uuid        primary key default gen_random_uuid(),
  slug         text        not null unique,
  title        text        not null,
  year         integer     not null,
  category_id  uuid        references public.categories(id) on delete set null,
  materials    text[]      not null default '{}',
  description  text        not null default '',
  whatsapp_url text,
  email        text,
  featured     boolean     not null default false,
  "order"      integer     not null default 0,
  renders      text[]      not null default '{}',
  published    boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index projects_order_idx   on public.projects ("order");
create index projects_slug_idx    on public.projects (slug);
create index projects_featured_idx on public.projects (featured) where featured = true;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

create policy "public read published projects"
  on public.projects for select to anon
  using (published = true);

create policy "admin read all projects"
  on public.projects for select to authenticated
  using (auth.jwt() ->> 'email' like '%@dookdesign.com');

create policy "admin insert projects"
  on public.projects for insert to authenticated
  with check (auth.jwt() ->> 'email' like '%@dookdesign.com');

create policy "admin update projects"
  on public.projects for update to authenticated
  using  (auth.jwt() ->> 'email' like '%@dookdesign.com')
  with check (auth.jwt() ->> 'email' like '%@dookdesign.com');

create policy "admin delete projects"
  on public.projects for delete to authenticated
  using (auth.jwt() ->> 'email' like '%@dookdesign.com');

-- Trigger function no debe ser callable via API
revoke execute on function public.set_updated_at() from anon, authenticated, public;
