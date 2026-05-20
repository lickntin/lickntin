-- 릭엔틴 Supabase — SQL Editor에서 이 파일만 실행하세요.
-- (쿼리 탭이 여러 개여도 내용은 이 파일 하나만 쓰면 됩니다.)

-- DB까지 완전 초기화할 때만 주석 해제 후 Run → 그다음 아래 전체 다시 Run
-- drop table if exists public.inquiries cascade;
-- drop table if exists public.admin_users cascade;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  name text not null,
  email text not null,
  phone text not null,
  project_type text not null,
  message text,
  package_budget text,
  status text not null default 'new'
    check (status in ('new', 'read', 'replied', 'archived')),
  privacy_agreed boolean not null default true
);

alter table public.inquiries
  add column if not exists phone text;

create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);

create index if not exists inquiries_status_idx
  on public.inquiries (status);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.inquiries enable row level security;
alter table public.admin_users enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on table public.inquiries to anon;
grant select, update on table public.inquiries to authenticated;

drop policy if exists "anon_insert_inquiries" on public.inquiries;
drop policy if exists "admin_select_inquiries" on public.inquiries;
drop policy if exists "admin_update_inquiries" on public.inquiries;
drop policy if exists "admin_users_no_api" on public.admin_users;

create policy "anon_insert_inquiries"
  on public.inquiries
  for insert
  to anon
  with check (
    char_length(trim(name)) between 1 and 200
    and email ~* '^[^@]+@[^@]+\.[^@]+$'
    and char_length(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g')) >= 9
    and char_length(trim(project_type)) between 1 and 200
    and privacy_agreed is true
    and coalesce(status, 'new') = 'new'
  );

create policy "admin_select_inquiries"
  on public.inquiries
  for select
  to authenticated
  using (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  );

create policy "admin_update_inquiries"
  on public.inquiries
  for update
  to authenticated
  using (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  );

create policy "admin_users_no_api"
  on public.admin_users
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- 관리자 연결 (Authentication에 계정 만든 뒤, 이메일만 본인 것으로 수정)
-- insert into public.admin_users (user_id, email)
-- select id, email from auth.users
-- where email = 'dhp168342@naver.com'
-- on conflict (user_id) do nothing;
