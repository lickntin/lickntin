-- 관리자 대시보드용 (로그인 계정을 admin_users에 연결)
-- Authentication에 dhp168342@naver.com 계정이 있어야 합니다.

insert into public.admin_users (user_id, email)
select id, email
from auth.users
where email = 'dhp168342@naver.com'
on conflict (user_id) do update set email = excluded.email;

-- 본인 조회 확인용 (대시보드에서 등록 여부 체크)
drop policy if exists "admin_read_self" on public.admin_users;
create policy "admin_read_self"
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

grant select on table public.admin_users to authenticated;
