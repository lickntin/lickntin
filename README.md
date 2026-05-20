# lickntin.com

릭엔틴 사이트 · Netlify · Supabase 문의

## Supabase (처음이거나 SQL을 비웠을 때)

1. GitHub에서 **`supabase/setup.sql`** 내용 복사
2. Supabase **SQL Editor** → **New query** → 붙여넣기 → **Run** (파일은 이것만)
3. **Authentication**에 관리자 이메일 계정 생성
4. SQL Editor **새 쿼리**에서 관리자 연결:

```sql
insert into public.admin_users (user_id, email)
select id, email from auth.users
where email = 'dhp168342@naver.com'
on conflict (user_id) do nothing;
```

Table Editor에 `inquiries`, `admin_users`가 보이면 OK.

## Netlify

| 항목 | 값 |
|------|-----|
| Build command | `node scripts/write-config.js` |
| Publish directory | `.` |

환경 변수: `SUPABASE_URL`, `SUPABASE_ANON_KEY` → 저장 후 **Trigger deploy**

## URL

- https://lickntin.com
- https://lickntin.com/admin/
