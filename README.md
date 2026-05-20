# lickntin.com

릭엔틴 사이트 · Netlify · Supabase 문의

## Supabase (처음이거나 SQL을 비웠을 때)

1. GitHub에서 **`supabase/setup.sql`** 내용 복사
2. Supabase **SQL Editor** → **New query** → 붙여넣기 → **Run** (파일은 이것만)
3. **Authentication**에 관리자 이메일 계정 생성
4. SQL Editor **새 쿼리** → **`supabase/admin_register.sql`** Run (대시보드 조회용)

문의가 안 보이면 1번·4번을 다시 실행하세요.

## Netlify

| 항목 | 값 |
|------|-----|
| Build command | `node scripts/write-config.js` |
| Publish directory | `.` |

환경 변수 (필수):

| 이름 | 어디서 복사 |
|------|-------------|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | anon public 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | **service_role** secret 키 (문의 저장용, 절대 공개 금지) |

저장 후 **Trigger deploy** (Functions 포함 배포)

## URL

- https://lickntin.com
- https://lickntin.com/admin/
