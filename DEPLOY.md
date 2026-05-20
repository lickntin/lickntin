# 배포 안내

## 폴더 위치

`C:\Users\USER\Downloads\lickntin-deploy`

개발 원본(`릭엔틴`)과 분리된 **배포 전용** 폴더입니다.

## GitHub 푸시

```powershell
cd "C:\Users\USER\Downloads\lickntin-deploy"
git add .
git commit -m "릭엔틴 사이트 lickntin.com 배포"
git push -u origin main
```

## Netlify

1. Site → Domain management → Add `lickntin.com`
2. www는 `_redirects`로 apex(`lickntin.com`)로 리다이렉트
