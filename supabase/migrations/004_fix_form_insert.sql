-- 문의 폼 "접수 중 문제" → RLS/권한 수정 (SQL Editor에서 이 파일만 실행)

-- API(anon) INSERT 권한 (SQL로 만든 테이블은 권한이 빠진 경우가 많음)
grant usage on schema public to anon, authenticated;
grant insert on table public.inquiries to anon;
grant select, update on table public.inquiries to authenticated;

alter table public.inquiries enable row level security;

-- phone 컬럼 없으면 추가
alter table public.inquiries
  add column if not exists phone text;

-- 기존 정책 전부 제거 후 재생성
drop policy if exists "anon_insert_inquiries" on public.inquiries;
drop policy if exists "admin_select_inquiries" on public.inquiries;
drop policy if exists "admin_update_inquiries" on public.inquiries;

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
    exists (
      select 1 from public.admin_users au where au.user_id = auth.uid()
    )
  );

create policy "admin_update_inquiries"
  on public.inquiries
  for update
  to authenticated
  using (
    exists (
      select 1 from public.admin_users au where au.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.admin_users au where au.user_id = auth.uid()
    )
  );
