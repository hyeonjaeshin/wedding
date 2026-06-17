# 모바일 청첩장 (Mobile Wedding Invitation)

Vue 3 + Vite + Tailwind CSS + Firebase 로 만든 **모바일 최적화 청첩장**입니다.
밝은 파스텔 오로라 톤의 디자인에 사진 슬라이드쇼 커버, 갤러리, 오시는 길,
참석 여부(RSVP), 방명록, 축의금 계좌, 배경음악(BGM) 기능을 포함합니다.

## 빠른 시작

```bash
# 1) 의존성 설치
npm install

# 2) 개발 서버 실행 (기본 http://localhost:5173)
npm run dev

# 3) 프로덕션 빌드 / 미리보기
npm run build
npm run preview
```

> Firebase 키가 없어도 **데모 모드**로 모든 화면이 동작합니다.
> (방명록/RSVP 는 저장되지 않고 메모리/콘솔에서만 동작)

## 내 청첩장으로 바꾸기

대부분의 내용은 **`src/data/invitation.js`** 한 파일에서 수정합니다.

| 수정 대상 | 위치 |
| --- | --- |
| 신랑/신부 이름·혼주·연락처 | `couple` |
| 예식 일시·장소·좌표 | `wedding` |
| 인사말(모시는 글) | `greeting` |
| 커버 슬라이드쇼 사진 | `coverImages` |
| 갤러리 사진 | `galleryImages` |
| 축의금 계좌 | `accounts` |
| 배경음악 | `bgm` |

- 사진은 **용도별 폴더**에 넣습니다:
  - 커버 슬라이드쇼 → `public/images/cover/` (경로 `/images/cover/파일명`)
  - 갤러리 → `public/images/gallery/` (경로 `/images/gallery/파일명`)
  - 어떤 이미지가 어디에 쓰이는지·교체 방법은 [`public/images/README.md`](./public/images/README.md) 참고.
- **이미지 최적화**: 사진을 넣은 뒤 `npm run optimize:images` 한 번 실행(가로 1600px로 리사이즈/압축).
  빌드 시에도 자동 압축됩니다. (원본은 별도 보관 권장 — 스크립트가 제자리 덮어쓰기)
- 배경음악은 `public/bgm/` 폴더 안내(README) 참고.

### 사진 업로드 페이지 (코드 수정 없이 갤러리 추가)

- 비밀 주소 **`/#/admin`** 으로 접속 → **패스코드**(`.env` 의 `VITE_ADMIN_PASSCODE`) 입력
- 사진을 선택하면 브라우저에서 자동 압축되어 **Firestore `gallery`** 에 저장되고, 갤러리 맨 뒤에 추가됩니다.
- 동작하려면 Firestore 보안 규칙 배포 필요: `firebase deploy --only firestore:rules`
- ⚠️ 패스코드는 클라이언트 검증(가벼운 보호)입니다. 강한 보안이 필요하면 Firebase Auth + Storage 로 확장하세요.

## Firebase 연동 (방명록 / RSVP 저장)

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 생성 후 **웹 앱** 추가
2. **Firestore Database** 생성 (프로덕션 모드)
3. 프로젝트의 설정값을 `.env.example` 참고하여 `.env` 로 작성

```bash
cp .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
```

4. 보안 규칙은 `firestore.rules` 에 정의되어 있습니다.

- `guestbook` 컬렉션: 방명록 (읽기 공개 / 쓰기 형식검증)
- `rsvp` 컬렉션: 참석 여부 (쓰기만 허용, 읽기는 콘솔에서)

## 배포 (Firebase Hosting)

```bash
npm install -g firebase-tools     # 최초 1회
firebase login
# .firebaserc 의 "default" 를 본인 프로젝트 ID 로 변경

npm run build                     # dist/ 생성
firebase deploy                   # Hosting + Firestore 규칙 배포
```

## Git 으로 관리하기

```bash
git init
git add .
git commit -m "feat: 모바일 청첩장 초기 구성"

# GitHub 원격 연결
git remote add origin https://github.com/<사용자명>/<저장소>.git
git branch -M main
git push -u origin main
```

> `.env`, `node_modules/`, `dist/` 는 `.gitignore` 로 커밋에서 제외됩니다.
> 실제 Firebase 키가 들어있는 `.env` 는 **절대 커밋되지 않습니다.**

## 기술 스택

- **Vue 3** (Composition API, `<script setup>`)
- **Vite 5** — 개발 서버 / 번들러
- **Tailwind CSS 3** — 모바일 우선 스타일 + 오로라 디자인 시스템
- **Firebase 10** — Firestore(데이터) + Hosting(배포)

### UI/UX 라이브러리

| 라이브러리 | 역할 |
| --- | --- |
| `@vueuse/motion` | 스크롤 등장 애니메이션(`v-motion`) |
| `@formkit/auto-animate` | 방명록 목록 부드러운 전환 |
| `swiper` | 갤러리 캐러셀 + 라이트박스 슬라이더 |
| `canvas-confetti` | RSVP/방명록 등록 시 축하 효과 |
| `@lucide/vue` | 아이콘 |

> 오로라 비주얼은 배경뿐 아니라 제목·신랑신부 이름·버튼·구분선에 적용됩니다
> (`.aurora-bg` / `.aurora-text` / `.aurora-btn` / `.glass-card`, `src/style.css`).
> `prefers-reduced-motion` 설정 시 애니메이션은 자동으로 멈춥니다.

## MCP 서버 (Claude Code 연동)

`.mcp.json` 에 다음 MCP 가 설정되어 있습니다. **Claude Code 재시작 후 로드**됩니다.

- **playwright** — 청첩장을 실제 브라우저로 열어 화면 캡처·검증 (키 불필요)
- **context7** — Tailwind/Swiper 등 라이브러리 최신 문서 참조 (키 불필요)
- **firebase** — Firestore 데이터/규칙 관리. 먼저 `firebase login` 필요

자세한 구조와 개발 가이드는 [`CLAUDE.md`](./CLAUDE.md) 를 참고하세요.
