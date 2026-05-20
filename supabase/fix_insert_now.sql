-- ★ 문의 접수 안 될 때: SQL Editor → New query → 이 파일 전체 → Run

grant usage on schema public to anon, authenticated;
grant insert on table public.inquiries to anon;
grant select, update on table public.inquiries to authenticated;

alter table public.inquiries add column if not exists phone text;

-- inquiries 정책 전부 삭제 후 다시 생성
drop policy if exists "anon_insert_inquiries" on public.inquiries;
drop policy if exists "admin_select_inquiries" on public.inquiries;
drop policy if exists "admin_update_inquiries" on public.inquiries;

create policy "anon_insert_inquiries"
  on public.inquiries
  for insert
  to anon
  with check (true);

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
