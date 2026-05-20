-- 릭엔틴 문의 접수 + 관리자 (Supabase SQL Editor에서 실행)

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

create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);

create index if not exists inquiries_status_idx
  on public.inquiries (status);

comment on table public.inquiries is '홈페이지 문의 폼 접수';

-- 관리자 계정 연결 (Supabase Auth 사용자 UUID)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.inquiries enable row level security;
alter table public.admin_users enable row level security;

-- 방문자(anon): 문의 INSERT만 가능, 조회 불가
create policy "anon_insert_inquiries"
  on public.inquiries
  for insert
  to anon
  with check (
    char_length(trim(name)) between 1 and 200
    and email ~* '^[^@]+@[^@]+\.[^@]+$'
    and char_length(regexp_replace(trim(phone), '[^0-9]', '', 'g')) >= 9
    and char_length(trim(project_type)) between 1 and 200
    and privacy_agreed is true
    and status = 'new'
  );

-- 등록된 관리자: 문의 조회
create policy "admin_select_inquiries"
  on public.inquiries
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

-- 등록된 관리자: 상태 변경
create policy "admin_update_inquiries"
  on public.inquiries
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

-- admin_users: 클라이언트에서 직접 수정 불가 (SQL로만 등록)
create policy "admin_users_no_api"
  on public.admin_users
  for all
  to anon, authenticated
  using (false)
  with check (false);
