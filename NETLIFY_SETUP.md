# Netlify 연동 (lickntin.com + Supabase)

## 1. GitHub 연결 (이미 했다면 건너뛰기)

1. [Netlify](https://app.netlify.com) 로그인
2. **Add new site** → **Import an existing project** → **GitHub**
3. 저장소 **`lickntin/lickntin`** 선택
4. 빌드 설정 확인:

| 항목 | 값 |
|------|-----|
| Branch | `main` |
| Build command | `node scripts/write-config.js` |
| Publish directory | `.` |

5. **Deploy site** (환경 변수 없이도 배포는 됨 — 문의 저장은 2단계 후 동작)

---

## 2. Supabase 키 → Netlify 환경 변수 (필수)

### Supabase에서 복사

**Project Settings** → **API** (또는 **Data API**)

| Netlify 변수 이름 | Supabase에서 복사할 값 |
|-------------------|------------------------|
| `SUPABASE_URL` | **Project URL** (`https://xxxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | **anon public** 또는 **Publishable key** |

`service_role` / **secret** 키는 **넣지 마세요.**

### Netlify에 등록

1. Netlify → 사이트 선택 → **Site configuration**
2. **Environment variables** → **Add a variable**
3. 아래 두 개 추가 (Scopes: **All** 또는 Production + Deploy previews):

```
SUPABASE_URL = https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Save** → **Deploys** → **Trigger deploy** → **Deploy site**

배포 로그에 `Wrote ... supabase-config.js (URL set)` 이 보이면 성공입니다.

---

## 3. 커스텀 도메인 (lickntin.com)

1. **Domain management** → **Add a domain** → `lickntin.com`
2. `www.lickntin.com` 도 추가 (선택)
3. 도메인 업체(가비아 등) DNS를 Netlify 안내대로 설정
4. **HTTPS** → 인증서 **Verified** 될 때까지 대기 (보통 수 분~24시간)
5. **HTTPS** → **Force HTTPS** 켜기

---

## 4. 동작 확인

| 확인 | URL / 방법 |
|------|------------|
| 사이트 | https://lickntin.com |
| 문의 테스트 | CONTACT → 폼 제출 → Supabase **Table Editor → inquiries** 에 행 추가 |
| 관리자 | https://lickntin.com/admin/ → `dhp168342@naver.com` 로그인 |

문의 실패 시: 브라우저 F12 → Console 오류 확인.  
`Supabase config missing` → Netlify 환경 변수·재배포 확인.

---

## 5. 빌드 오류 시

### Secrets scanning / `SUPABASE_ANON_KEY` 차단

Netlify가 빌드 결과물의 anon 키를 “비밀”로 막으면 실패합니다.  
Supabase **URL·anon(public) 키는 브라우저에 노출되는 것이 정상**이며, `netlify.toml`에 `SECRETS_SCAN_OMIT_KEYS = SUPABASE_URL,SUPABASE_ANON_KEY` 가 설정되어 있습니다.

재배포만 하면 됩니다. **service_role** 키는 절대 빌드·저장소에 넣지 마세요.

### `netlify.toml` 파싱 실패

- 파일이 UTF-16이면 실패합니다. 저장소의 최신 `main` 을 pull 후 재배포하세요.

### `node: command not found`

- Netlify **Site configuration → Build & deploy → Build image** 에서 Node 포함 이미지 사용 (기본값이면 OK)

---

## 체크리스트

- [ ] GitHub `lickntin/lickntin` 연결
- [ ] `SUPABASE_URL`, `SUPABASE_ANON_KEY` 환경 변수
- [ ] 재배포 완료
- [ ] `lickntin.com` DNS + HTTPS Verified
- [ ] Supabase SQL + `admin_users` 등록 완료
- [ ] 문의 폼 / 관리자 페이지 테스트
