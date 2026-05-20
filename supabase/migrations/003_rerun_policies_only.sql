-- 테이블은 이미 있는데 정책만 다시 맞출 때 (001 전체 재실행 X)

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
    and status = 'new'
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

create policy "admin_users_no_api"
  on public.admin_users
  for all
  to anon, authenticated
  using (false)
  with check (false);
