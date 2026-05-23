# 검색엔진 등록 가이드 (Google · Naver)

배포된 후 **1회만 진행하면 됩니다**. 이후 사이트맵을 다시 제출할 필요는 없지만, 새 글이 늘어나면 `sitemap.xml`을 업데이트해 다시 제출하면 색인이 빨라집니다.

## 사전 확인

- 배포된 URL: `https://medifluencer-website.vercel.app/`
- 사이트맵: `https://medifluencer-website.vercel.app/sitemap.xml`
- robots: `https://medifluencer-website.vercel.app/robots.txt`

위 두 URL을 브라우저에서 직접 열어 정상적으로 보이는지 먼저 확인합니다 (xml과 텍스트가 떠야 함).

---

## ① Google Search Console (전 세계 검색)

1. https://search.google.com/search-console 접속 후 Google 계정으로 로그인
2. **속성 추가** → **URL 접두어** 선택
3. URL 입력: `https://medifluencer-website.vercel.app/` → **계속**
4. **소유권 확인** 화면에서 가장 쉬운 방식 두 가지:

   ### 방식 A · HTML 태그 (권장)
   - "HTML 태그" 옆 화살표 클릭
   - 표시되는 `<meta name="google-site-verification" content="...">` 코드 복사
   - `index.html`의 `<head>` 안에 붙여넣기
   - GitHub에 push → Vercel 자동 재배포
   - Search Console로 돌아가 **확인** 클릭

   ### 방식 B · HTML 파일 업로드
   - "HTML 파일" 옆 화살표 클릭
   - `google[xxxx].html` 파일 다운로드
   - 이 파일을 `website/` 루트에 그대로 둠
   - GitHub에 push → Vercel 자동 재배포
   - Search Console로 돌아가 **확인** 클릭

5. 확인 완료 후 좌측 메뉴 **Sitemaps** 클릭
6. "새 사이트맵 추가" 입력란에 `sitemap.xml` 입력 → **제출**
7. **상태: 성공** 표시되면 완료

> 색인까지 며칠~몇 주 걸립니다. 보통 1~2주 안에 검색에 노출되기 시작합니다.

---

## ② Naver 서치어드바이저 (한국 검색)

1. https://searchadvisor.naver.com 접속 후 네이버 계정으로 로그인
2. 우측 상단 **웹마스터 도구**
3. 사이트 URL 입력: `https://medifluencer-website.vercel.app/` → **추가**
4. **소유 확인** 화면에서 두 가지 방식 중 선택:

   ### 방식 A · HTML 태그
   - "HTML 태그" 선택
   - `<meta name="naver-site-verification" content="...">` 코드 복사
   - `index.html`의 `<head>` 안에 붙여넣기
   - GitHub push → Vercel 재배포
   - 네이버에서 **소유 확인**

   ### 방식 B · HTML 파일
   - `naver[xxx].html` 파일 다운로드
   - `website/` 루트에 둠
   - GitHub push → Vercel 재배포
   - 네이버에서 **소유 확인**

5. 좌측 메뉴 **요청 → 사이트맵 제출**
6. 입력란에 `sitemap.xml` 입력 → **확인**

---

## ③ Bing / 다음

### Bing (마이크로소프트, ChatGPT 검색 등이 활용)
- https://www.bing.com/webmasters
- Google Search Console과 연동: **"Import from Google Search Console"** 한 번 클릭으로 끝

### Daum / 카카오
- 별도 도구 없음. 자동 색인. Naver만 등록해도 한국 검색 트래픽 대부분 커버.

---

## ④ 두 메타 태그를 함께 넣는 방법

```html
<head>
  <!-- ... 기존 메타들 ... -->
  <meta name="google-site-verification" content="...">
  <meta name="naver-site-verification" content="...">
</head>
```

메인 `index.html`에만 넣어도 양쪽 검색엔진이 인증 성공함.

---

## ⑤ 새 블로그 글 추가 시 sitemap 갱신

블로그 글을 추가하면 `sitemap.xml`에 새 URL을 추가해야 검색엔진이 빠르게 색인합니다.

`sitemap.xml`에 다음 블록을 한 줄씩 추가:
```xml
<url>
  <loc>https://medifluencer-website.vercel.app/blog-post.html?slug=새글의슬러그</loc>
  <lastmod>2026-XX-XX</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>
```

GitHub push → Vercel 자동 재배포.

---

## ⑥ 등록 후 확인

- **Google**: Search Console → **Coverage** 메뉴에서 색인 페이지 수 확인 (등록 후 7~14일)
- **Naver**: 네이버에서 `site:medifluencer-website.vercel.app` 검색해 우리 페이지 노출 확인

---

## ⑦ 도메인 변경 시 주의

커스텀 도메인 연결하면 **새 URL로 검색 등록을 다시** 해야 합니다. 기존 vercel.app 등록은 그대로 두되, 새 도메인을 별도 속성으로 추가하면 됩니다. `sitemap.xml` 안의 URL 도메인도 함께 바꿔야 합니다.
