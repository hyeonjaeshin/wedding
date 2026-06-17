# 이미지 에셋 가이드 (위치 ↔ 사용처 매핑)

이 폴더의 이미지는 **용도별 폴더**로 구분되어 있습니다.
어떤 이미지가 어디에 쓰이는지, 어디를 수정하면 되는지 한눈에 보도록 정리했습니다.

## 폴더 ↔ 사용처 매핑

| 폴더 | 사용 컴포넌트 | 데이터 키 (`src/data/invitation.js`) | 화면 위치 | 권장 규격 |
| --- | --- | --- | --- | --- |
| `cover/` | `src/components/sections/MainCover.vue` | `coverImages` | 첫 화면 자동 전환 슬라이드쇼 | 세로형 4:5~9:16, 1080px 이상 |
| `gallery/` | `src/components/sections/Gallery.vue` | `galleryImages` | 갤러리 캐러셀 + 썸네일 + 라이트박스 | 정사각(1:1) 권장, 1080px 이상 |

> 그 외 에셋
> - `public/favicon.svg` — 브라우저 탭 아이콘 (`index.html` 에서 참조)
> - `public/bgm/` — 배경음악 (별도 `public/bgm/README.md` 참고)

## 사진 교체 방법

1. 이 폴더(`cover/` 또는 `gallery/`)에 실제 사진(jpg/png/webp 등)을 넣습니다.
2. `src/data/invitation.js` 의 `coverImages` / `galleryImages` 배열 경로만 새 파일명으로 수정합니다.
   - 예) `'/images/cover/our-photo.jpg'`, `'/images/gallery/01.jpg'`
3. 파일을 **추가/삭제하면 배열 항목 수도 맞춰** 주세요. (개수 제한 없음)

> 경로는 항상 `public/` 를 기준으로 한 절대경로(`/images/...`)로 적습니다.
> 컴포넌트는 경로를 직접 갖지 않고 `invitation.js` 에서만 import 하므로, **이미지 변경은 이 폴더 + `invitation.js` 만** 손대면 됩니다.

## 이미지 최적화 (중요)

원본 사진(수 MB)을 그대로 두면 모바일 로딩이 느립니다. 두 단계로 최적화됩니다:

1. **리사이즈 스크립트**(권장, 가장 큰 효과): 사진을 넣은 뒤 한 번 실행
   ```bash
   npm run optimize:images   # 가로 max 1600px + JPEG q80 으로 제자리 압축
   ```
   ⚠️ 이 폴더의 사본을 **덮어쓰므로 원본은 카메라/다른 곳에 보관**하세요. (재실행해도 안전)
2. **빌드 자동 압축**: `npm run build` 시 `vite-plugin-image-optimizer` 가 `dist` 이미지를 추가 압축.

## 손님이 직접 업로드한 갤러리 사진

`#/admin` 페이지(패스코드)에서 업로드한 사진은 파일이 아니라 **Firestore `gallery` 컬렉션**에
압축되어 저장되고, 갤러리 맨 뒤에 자동으로 추가됩니다. (이 폴더와는 별개)
