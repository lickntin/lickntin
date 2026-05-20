# Supabase + Netlify 문의·관리자 설정

## 1. Supabase 프로젝트 만들기

1. [supabase.com](https://supabase.com) 로그인 → **New project**
2. 프로젝트 생성 후 **Project Settings → API** 에서 복사:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

## 2. DB 테이블·보안 (SQL) — **반드시 먼저**

`admin_users` INSERT 전에 **테이블 생성 SQL**을 먼저 실행해야 합니다.  
안 하면 `relation "public.admin_users" does not exist` 오류가 납니다.

**SQL Editor** → New query → 아래 파일 **전체** 붙여넣기 → **Run**:

`supabase/migrations/001_inquiries.sql`

성공 후 **Table Editor**에 `inquiries`, `admin_users` 두 테이블이 보이면 OK.

### 폼 제출이 계속 실패할 때 (`접수 중 문제가 발생했습니다`)

이미 `001`을 실행했는데 문의 폼만 실패하면, **아래 파일만** SQL Editor에서 Run:

`supabase/migrations/004_fix_form_insert.sql`

(anon INSERT 권한 + RLS 정책을 다시 맞춥니다. `001` 전체를 다시 실행할 필요 없습니다.)

## 3. 관리자 계정 만들기

1. **Authentication → Users**에서 사용자가 이미 있으면 그대로 사용  
   (없으면 Add user → 이메일·비밀번호 → **Auto Confirm User** 체크)

2. **테이블 생성(2번)을 끝낸 뒤**, SQL Editor에서 **새 쿼리**로 실행:

```sql
insert into public.admin_users (user_id, email)
select id, email
from auth.users
where email = 'dhp168342@naver.com'
on conflict (user_id) do nothing;
```

이메일은 Authentication에 등록한 주소와 **완전히 동일**하게 넣으세요.

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
