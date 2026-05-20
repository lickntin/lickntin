-- 이미 001을 실행한 경우 SQL Editor에서 이 파일만 실행

alter table public.inquiries
  add column if not exists phone text;

drop policy if exists "anon_insert_inquiries" on public.inquiries;

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
