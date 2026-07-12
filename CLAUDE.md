# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 이 저장소의 모든 문서/주석은 한글로 작성합니다.

## 프로젝트 개요

Vue 3 + Vite + Tailwind CSS + Firebase 로 만든 **모바일 청첩장** 단일 페이지 앱.
한 화면(`max-w-md` 단일 컬럼)을 스크롤하며 섹션을 따라 내려가는 구조이며,
방명록/RSVP 는 Firebase Firestore 에 저장한다. 디자인은 **밝은 파스텔 오로라 톤**으로,
오로라 그라데이션이 배경·제목·신랑신부 이름·버튼·divider 전반에 흐른다.

### 사용 라이브러리 (UI/UX)

- `@vueuse/motion` — `v-motion` 선언적 스크롤/등장 애니메이션 (`main.js` 에서 `MotionPlugin` 등록)
- `@formkit/auto-animate` — `v-auto-animate` 리스트 부드러운 전환 (방명록 목록)
- `swiper` (v12, `swiper/vue`) — 갤러리 페이드 캐러셀 + 라이트박스 슬라이더
- `canvas-confetti` — RSVP/방명록 등록 성공 시 축하 효과 (`composables/useConfetti.js`)
- `@lucide/vue` — 아이콘 세트 (인라인 SVG 대체)

## 자주 쓰는 명령어

```bash
npm install            # 의존성 설치
npm run dev            # 개발 서버 (http://localhost:5173)
npm run build          # 프로덕션 빌드 → dist/ (이미지 자동 압축 포함)
npm run preview        # 빌드 결과 로컬 미리보기
npm run optimize:images # public/images 사진 리사이즈·압축(1회성, 제자리 덮어쓰기)

firebase deploy    # Firebase Hosting + Firestore 규칙 배포 (firebase-tools 필요)
```

> Hosting 은 `firebase.json` 에서 `dist/` 를 배포하고 모든 경로를 `/index.html` 로
> rewrite 하는 SPA 설정이다.

> 테스트 러너는 아직 없다. 동작 검증은 `npm run build`(타입/구문 오류 확인) +
> `npm run dev` 수동 확인으로 한다.

## 배포 (⚠️ 중요 — 새 세션에서 자주 누락됨)

**Git 과 실제 사이트는 자동 연결되어 있지 않다.** `git push` 를 해도 실제 도메인은
바뀌지 않는다(GitHub Actions 등 자동 배포 미설정, `.github/workflows` 없음).
git 은 소스 백업용(`github.com/hyeonjaeshin/wedding`)일 뿐이다.
**실제 도메인에 반영하려면 반드시 아래 2단계를 직접 실행해야 한다.**

```bash
npm run build                       # ① dist/ 에 최신 결과물 생성
npx firebase deploy --only hosting  # ② Firebase Hosting 업로드 → 즉시 실제 사이트 반영
```

- Firebase 프로젝트: `toywedding-31fc5` (`.firebaserc` default). 로그인 계정: `bbbb8172@gmail.com`.
- **Hosting 사이트 2개**(`firebase.json`, 둘 다 `dist/` 배포):
  - **`hyeonjae-jiyoon`** → https://hyeonjae-jiyoon.web.app **(실제 청첩장 도메인)**
  - `toywedding-31fc5` → https://toywedding-31fc5.web.app (예비)
  - `--only hosting` 이면 두 사이트 모두 배포. 실제 도메인만 원하면 `--only hosting:hyeonjae-jiyoon`.
- 실제 공개 주소(`siteUrl`)는 `src/data/invitation.js` 의 `siteUrl` 및 `index.html` 의 og:url 에 하드코딩 — 도메인이 바뀌면 함께 갱신.
- 캐시 헤더가 `no-cache` 라 배포 후 새로고침하면 최신 화면이 바로 보인다.
- Firestore 규칙만 배포: `firebase deploy --only firestore:rules` (규칙 변경 시 재배포 필요, MCP 로는 반영 안 됨 → CLI 사용).

## 아키텍처 (큰 그림)

- **`src/App.vue`** — 유일한 조립 지점. 섹션 컴포넌트를 순서대로 나열하고
  각 섹션에 `v-motion`(공통 `rise` 프리셋)으로 스크롤 등장 애니메이션을 준다.
  BGM 버튼은 최상위에 고정. (`useScrollReveal.js` 는 비-motion 환경용 폴백 유틸로 남겨둠)
- **`src/data/invitation.js`** — 콘텐츠의 **단일 출처(Single Source of Truth)**.
  이름·일정·장소·인사말·사진경로·계좌·BGM 을 모두 이 파일에서 관리한다.
  컴포넌트는 여기서 import 해서 렌더링만 한다. → 내용 변경은 거의 이 파일만 수정.
- **`src/firebase.js`** — `.env` 의 `VITE_FIREBASE_*` 로 초기화. **키가 없으면
  `db = null` 을 export 하고 데모 모드로 동작**(앱이 죽지 않음). `isConfigured` 로 상태 구분.
  Analytics 는 `measurementId` 가 있고 브라우저가 지원할 때만(`isSupported()`) 안전하게 켠다.
- **`src/composables/`** — Firebase/브라우저 로직을 캡슐화한 재사용 단위.
  - `useGuestbook.js` — `guestbook` 컬렉션 실시간 구독(`onSnapshot`) + 추가(`addDoc`).
    `db` 가 null 이면 로컬 배열로 동작.
  - `useRsvp.js` — `rsvp` 컬렉션에 제출(`addDoc`). null 이면 콘솔 출력.
  - `useBgm.js` — `Audio` 객체 재생/일시정지. 모바일 자동재생 제한 때문에
    **첫 사용자 상호작용(click/touch) 시 1회 자동재생** 시도.
  - `useScrollReveal.js` — `IntersectionObserver` 로 `.reveal` 에 `.is-visible` 부착(폴백).
  - `useConfetti.js` — `canvas-confetti` 파스텔 컨피티. `prefers-reduced-motion` 시 생략.
  - `useGallery.js` — `gallery` 컬렉션 구독 + 업로드/삭제. `images = 정적 galleryImages + 업로드`.
  - `useImageCompress.js` — canvas 로 가로 max 1280px 리사이즈 + JPEG 압축(dataURL). 업로드 전 사용.
- **`src/components/`** — 용도별로 묶여 있다.
  - `sections/` — 페이지 섹션(위→아래 순서): `MainCover` / `Invitation` / `Countdown` /
    `Gallery` / `Location` / `Rsvp` / `Guestbook` / `Account` / `Footer`.
  - `ui/` — 재사용 UI 조각: `SectionTitle` / `AccordionItem` / `FloatingPetals`.
  - `admin/AdminUpload.vue` — 사진 업로드(관리) 화면. `#/admin` 해시 라우트로만 진입.
  - `BgmPlayer.vue` — 화면 위에 고정되는 전역 오버레이라 `components/` 루트에 둔다.
- **라우팅**: vue-router 없이 `App.vue` 가 `location.hash` 로 분기 —
  `#/admin` → `AdminUpload`, 그 외 → 청첩장.

### 프로젝트 구조

```
public/
├── favicon.svg
├── bgm/                 # 배경음악 (+ README)
└── images/
    ├── README.md        # 에셋 위치 ↔ 사용처 매핑(어떤 이미지가 어디 쓰이는지)
    ├── cover/           # 커버 슬라이드쇼 → sections/MainCover.vue (coverImages)
    └── gallery/         # 갤러리          → sections/Gallery.vue   (galleryImages)
src/
├── App.vue              # 조립 지점(섹션 나열 + 스크롤 진행바)
├── main.js  style.css  firebase.js
├── data/invitation.js   # 콘텐츠 단일 출처
├── composables/         # useGuestbook/useRsvp/useBgm/useConfetti/useScrollReveal
└── components/
    ├── BgmPlayer.vue     # 전역 오버레이
    ├── sections/         # 페이지 섹션 9종
    └── ui/               # SectionTitle / AccordionItem / FloatingPetals
```

> 이미지는 컴포넌트가 경로를 직접 갖지 않고 `data/invitation.js` 에서만 참조한다.
> 에셋 추가·교체 규칙은 `public/images/README.md` 에 표로 정리되어 있다.

### 데이터 흐름 요약

```
.env ──► firebase.js (db | null) ──► composables ──► 섹션 컴포넌트
invitation.js (콘텐츠) ─────────────────────────────► 섹션 컴포넌트
```

## 핵심 구현 메모

- **첫 화면 슬라이드쇼**: `MainCover.vue` 가 `coverImages` 배열을 5초 간격
  `setInterval` 로 순환하며 `<transition-group>` 페이드로 전환.
- **데모 모드 폴백**: Firebase 미설정 환경에서도 UI 시연이 가능하도록
  composable 마다 `if (!db)` 분기를 둔다. 새 Firestore 기능 추가 시 이 패턴을 유지할 것.
- **보안 규칙**: `firestore.rules` 에서 `guestbook` 은 형식검증 후 생성 허용/수정·삭제 금지,
  `rsvp` 는 생성만 허용·읽기 금지(관리자 콘솔 확인), `gallery` 는 읽기 공개+생성(1MB 검증)+삭제 허용.
  컬렉션 스키마/규칙 변경 시 **재배포 필요**(`firebase deploy --only firestore:rules`).
- **이미지 최적화**: ① `npm run optimize:images`(sharp, 가로 1600px 리사이즈, 제자리 덮어쓰기)
  ② 빌드 시 `vite-plugin-image-optimizer`(`vite.config.js`, SVG 제외)로 `dist` 추가 압축.
- **사진 업로드(#/admin)**: 패스코드(`.env` `VITE_ADMIN_PASSCODE`) 게이트 → 클라이언트 압축
  (`useImageCompress`) → Firestore `gallery` 저장. 갤러리는 정적 사진 뒤에 업로드분을 이어 붙인다.
  ⚠️ 패스코드/삭제는 클라이언트 수준 보호(약함) — 강보안 필요 시 Auth+Storage 로 확장.
- **지도**: `Location.vue` 의 `#map-container` 가 카카오맵/네이버맵 SDK 마운트 지점.
  키는 `.env` 의 `VITE_KAKAO_MAP_KEY` / `VITE_NAVER_MAP_CLIENT_ID` 사용.

## 디자인 규약 (오로라 시스템)

핵심 유틸은 모두 `src/style.css` 에 정의. 새 UI 는 임의 스타일 대신 아래 토큰을 재사용한다.

- `.aurora-bg` — 움직이는 파스텔 오로라 배경(바깥 여백). `@keyframes auroraDrift`.
- `.aurora-text` / `.aurora-text-light` — 그라데이션 글자(제목·신랑신부 이름).
  밝은 배경(사진 커버) 위에는 `-light` 변형 사용. `@keyframes auroraHue`.
- `.aurora-btn` / `.aurora-btn-outline` — 핵심 CTA / 보조 버튼.
- `.glass-card` — 글래스모피즘 카드(폼·방명록·계좌·카운트다운 타일).
- `.aurora-divider` — 그라데이션 구분선.
- `ui/FloatingPetals.vue` — 떠다니는 꽃잎/반짝임 장식 레이어(`variant="petal|sparkle"`).
  커버에 사용. `pointer-events-none`, `prefers-reduced-motion` 시 숨김.
- 상단 **오로라 스크롤 진행바**는 `App.vue` 의 `scroll` 리스너 + `.scroll-progress` 로 구현.
- 모바일 우선. 본문은 `.invitation-shell`(`mx-auto max-w-md`) 단일 컬럼.
- 색상 토큰: `cream` / `sage` / `rosewood` / `aurora(pink·lilac·blue·mint)` / `ink`
  (`tailwind.config.js`). 새 색은 이 토큰을 확장해서 쓴다.
- 섹션 진입 모션은 `App.vue` 의 `v-motion`, 리스트는 `v-auto-animate` 로 처리.
- **접근성**: 모든 모션 유틸은 `@media (prefers-reduced-motion: reduce)` 에서 정지하도록
  `style.css` 에 정의되어 있다. 새 애니메이션 추가 시 이 미디어쿼리에 포함시킬 것.

## MCP 서버 (`.mcp.json`)

프로젝트 스코프로 다음 MCP 가 설정되어 있다(모두 `npx` 실행). **추가/변경 후 Claude Code 재시작 시 로드**.

- **playwright** — dev 서버를 실제 브라우저로 열어 스크린샷·시각 검증.
- **context7** — Tailwind/Swiper/VueUse 등 라이브러리 최신 문서 참조.
- **firebase** — Firestore 데이터·규칙 관리. **`firebase login` 후 사용 가능**.

## 콘텐츠 교체 체크리스트

1. `src/data/invitation.js` 의 텍스트/일정/계좌 수정
2. `public/images/cover/`·`gallery/` 의 더미 SVG 를 실제 사진으로 교체 후
   `coverImages`/`galleryImages` 경로 갱신 (자세한 규칙: `public/images/README.md`)
3. (선택) `public/bgm/` 에 음원 추가 후 `bgm.src` 확인
4. `index.html` 의 `<title>` 과 Open Graph 메타(공유 미리보기) 수정
