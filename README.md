# Medifluencer · Web

GINCON과 함께하는 의료 전문 인플루언서 그룹의 공식 웹사이트.

## 구조

```
website/
├── index.html              · Home
├── about.html              · About
├── services.html           · 3 pillars
├── product.html            · Flagship package
├── partnership.html        · B2B partnership
├── blog.html               · Blog list
├── blog-post.html          · Blog detail (?slug=...)
├── contact.html            · Contact form
├── admin/                  · Admin console (Supabase auth)
│   ├── index.html          · → login or inbox
│   ├── login.html
│   ├── inbox.html          · Contact form submissions
│   ├── posts.html          · Blog post list
│   ├── post-edit.html      · Blog post editor
│   └── settings.html       · Password change
└── assets/
    ├── styles.css          · Design system
    ├── main.js             · Lang toggle, scroll, mouse, form
    ├── supabase.js         · Supabase REST client
    └── media/              · Hero video + poster
```

## 백엔드 · Supabase

- Project: `ayozomzmoctmlwrlfbkx`
- URL: https://ayozomzmoctmlwrlfbkx.supabase.co
- Tables:
  - `inquiries` — Contact form submissions (anon insert, authed manage)
  - `blog_posts` — Blog posts (public read where status='published')
- RLS enabled on both tables.

## 어드민 로그인

- URL: `/admin/`
- Email: `passion4050@gmail.com`
- 임시 비밀번호: `Medi#flu2026!` ← **첫 로그인 후 Settings에서 즉시 변경하세요**

## 배포 (Vercel + GitHub)

이 폴더는 정적 사이트라 빌드 단계가 없습니다.

> **주의:** 폴더 안에 빈 `.git/` 디렉토리가 남아 있을 수 있습니다 (Cowork 샌드박스 권한 문제로 생성됨).
> Windows 파일 탐색기에서 "숨김 항목 표시" 켠 뒤 `.git` 폴더를 삭제하고 시작하세요.

1. **GitHub 리포지토리 만들기**
   - https://github.com/new
   - 이름: `medifluencer-website` (또는 원하는 이름)
   - Public/Private 선택
   - "Initialize this repository with: README" 체크하지 않음

2. **이 폴더를 푸시** (PowerShell 또는 Git Bash에서)
   ```bash
   cd "C:\Users\user\Documents\Claude\Projects\메디플루언서\website"
   # .git 폴더가 있으면 먼저 제거: Remove-Item -Recurse -Force .git
   git init
   git add .
   git commit -m "Initial commit: Medifluencer web"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/medifluencer-website.git
   git push -u origin main
   ```

3. **Vercel에서 import**
   - https://vercel.com/new
   - GitHub 계정 연결 후 방금 만든 리포지토리 선택
   - Framework Preset: **Other** (정적)
   - Root Directory: `./` (기본)
   - Build Command: 비워두기
   - Output Directory: 비워두기
   - **Deploy** 버튼

배포가 완료되면 `https://medifluencer-website.vercel.app` 같은 URL이 부여됩니다.

## 후속 변경

GitHub에 푸시할 때마다 Vercel이 자동으로 재배포합니다.
어드민에서 블로그 글을 추가/수정하는 건 GitHub 푸시 없이 즉시 반영됩니다 (Supabase 통해 동적 로드).

## 도메인 연결 (선택)

Vercel 프로젝트 설정 → Domains → 보유 도메인 추가.
