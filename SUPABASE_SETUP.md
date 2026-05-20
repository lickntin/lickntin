# Supabase + Netlify 문의·관리자 설정

## 1. Supabase 프로젝트 만들기

1. [supabase.com](https://supabase.com) 로그인 → **New project**
2. 프로젝트 생성 후 **Project Settings → API** 에서 복사:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

## 2. DB 테이블·보안 (SQL)

**SQL Editor** → New query → `supabase/migrations/001_inquiries.sql` 내용 전체 붙여넣기 → **Run**

## 3. 관리자 계정 만들기

1. **Authentication → Users → Add user → Create new user**
   - 이메일: 관리자용 (예: `admin@yourdomain.com`)
   - 비밀번호: 강한 비밀번호 설정
   - **Auto Confirm User** 체크

2. **SQL Editor**에서 (이메일을 본인 것으로 변경):

```sql
insert into public.admin_users (user_id, email)
select id, email
from auth.users
where email = 'admin@yourdomain.com'
on conflict (user_id) do nothing;
```

## 4. Netlify 환경 변수

**Site configuration → Environment variables** 에 추가:

| Key | Value |
|-----|--------|
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | anon public 키 |

저장 후 **Deploys → Trigger deploy** (빌드 시 `js/supabase-config.js` 자동 생성)

## 5. 사용 URL

| 용도 | URL |
|------|-----|
| 홈페이지 문의 | https://lickntin.com (CONTACT 폼) |
| 관리자 대시보드 | https://lickntin.com/admin/ |

관리자 페이지는 검색엔진에 노출되지 않도록 `noindex` 처리되어 있습니다.

## 6. 로컬 테스트

```powershell
cd lickntin-deploy
copy js\supabase-config.example.js js\supabase-config.js
# supabase-config.js 에 URL·anonKey 입력
npx serve .
```

## 보안 참고

- **service_role** 키는 절대 프론트/Netlify 공개 변수에 넣지 마세요.
- 방문자는 **문의 등록만** 가능하고, 목록 조회는 **admin_users에 등록된 로그인 계정**만 가능합니다.
