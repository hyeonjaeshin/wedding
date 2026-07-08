// ───────────────────────────────────────────────────────────
// 청첩장의 모든 콘텐츠(문구/이름/일정/장소/계좌/사진)를 한 곳에서 관리합니다.
// 청첩장 내용을 바꾸려면 대부분 이 파일만 수정하면 됩니다.
// 사진은 용도별 폴더에 넣습니다(에셋 매핑은 public/images/README.md 참고):
//   · 커버 슬라이드쇼 → public/images/cover/   → 경로 "/images/cover/파일명"
//   · 갤러리          → public/images/gallery/ → 경로 "/images/gallery/파일명"
// ───────────────────────────────────────────────────────────

// 청첩장 공개 주소 — QR/공유 링크의 단일 출처. 배포 도메인이 바뀌면 이 값만 수정.
export const siteUrl = 'https://hyeonjae-jiyoon.web.app/'

export const couple = {
  groom: {
    name: '신현재',
    shortName: '현재',
    role: '신랑',
    phone: '010-2654-2452',
    father: '신윤봉',
    mother: '김애란',
    // 자녀 관계 표기 (예: 장남 / 차남 / 아들)
    relation: '차남',
  },
  bride: {
    name: '유지윤',
    shortName: '지윤',
    role: '신부',
    phone: '010-9109-0793',
    father: '유병인',
    mother: '우혜숙',
    relation: '삼녀',
  },
}

export const wedding = {
  // 화면 표기용
  dateText: '2026년 10월 31일 토요일 오후 1시 50분',
  dateShort: '2026. 10. 31. SAT PM 1:50',
  // D-day 계산 및 캘린더용 (현지 시간)
  dateISO: '2026-10-31T13:50:00+09:00',
  venue: {
    name: '빌라디지디',
    hall: '5층 그랜드볼룸홀',
    // 신부대기실 위치(있으면 홀 아래에 함께 표시). 없으면 '' 로.
    brideRoom: '신부대기실 6층',
    address: '경기도 안산시 단원구 광덕4로 140',
    addressDetail: '(고잔동 703)',
    tel: '031-487-8100',
    // 지도/길찾기 검색어 — 장소명으로 검색해 예식장이 바로 잡히게 한다(미지정 시 주소 사용).
    searchKeyword: '빌라디지디 안산',
    // 카카오 지도 SDK 를 쓰려면 .env 의 VITE_KAKAO_MAP_KEY 설정 + 좌표(lat/lng) 입력.
    lat: null,
    lng: null,
  },
}

// 메인 커버 — 로딩 시 즉시 뜨는 기본(정적) 커버. git 에 함께 배포된다.
// 관리자(#/admin)가 커버를 업로드하면 그 사진들로 전환되고, 없으면 이 정적 커버가 계속 표시된다.
export const coverImages = ['/images/cover/cover-1.jpg']

// 인사말 (모시는 글)
export const greeting = {
  title: '소중한 분들을 초대합니다',
  message: [
    '친구라는 이름으로 시작해',
    '나이도, 취향도 다른 둘이었지만',
    '서로에게 가장 편한 사람이 되었습니다.',
    '',
    '좋아하는 것도, 입맛도 제각각이지만',
    '그 다름이 서로를 채워준다는 걸',
    '지난 5년이 알려주었습니다.',
    '',
    '이제 그 마음을 평생으로 잇고자 합니다.',
    '오시어 축복해 주시면 더없이 감사하겠습니다.',
  ],
}

// 갤러리 사진 (캐러셀 + 라이트박스). public/images/gallery/ 에 추가하고 경로를 넣으세요.
export const galleryImages = [
]

// 축의금 계좌 (접기/펼치기 + 복사 기능)
export const accounts = {
  groom: {
    label: '신랑측',
    list: [
      { holder: '신현재', bank: '신한은행', number: '110-505-032468' },
    ],
  },
  bride: {
    label: '신부측',
    list: [
      { holder: '유지윤', bank: '농협', number: '302-0800-1499-11' },
    ],
  },
}

// 두 사람이 함께한 시작일 — Countdown.vue 의 "함께한 시간" 카운터
export const relationship = {
  sinceISO: '2021-12-29',
}

// 찾아오는 길 안내 — Location.vue 에서 렌더 (공식 약도 기준)
export const directions = {
  // 지하철(여러 줄 가능 — \n 으로 줄바꿈)
  subway:
    '4호선 · 수인분당선 고잔역\n' +
    'KTX·기차 이용 시: 수원역 하차 → 수인분당선 환승 →\n' +
    '고잔역(고대안산병원) 2번 출구에서 왼쪽 대로변 따라 200m',
  // 정류장별 버스 노선
  bus: [
    { stop: '고잔역 뒤 정류장 하차', lines: '97, 98, 99-1, 500' },
  ],
  // 자가용 안내(건물 내 주차 불가) + 연계 주차장 목록 + 대중교통 권고
  car: '건물 내 주차가 불가하여 건너편 연계 주차장을 이용해 주세요.',
  parking: [
    { name: '제1주차장 · 화랑주차타워', note: '2시간 무료', addr: '단원구 광덕서로 106' },
    { name: '제2주차장 · 월드타워 주차장', note: '2시간 무료', addr: '단원구 광덕3로 135-18' },
    { name: '제3주차장 · 고객 전용 주차장', note: '유료 (일요일 무료)', addr: '' },
  ],
  notice: '주차 혼잡이 예상되오니 가급적 대중교통을 이용해 주시기 바랍니다.',
  // 오시는 길 약도 이미지(클릭 시 지도 앱). 빈 문자열이면 미표시.
  image: '/images/directions/route.jpg',
}

// 안내 문구(화환 사양 등) — Location.vue 에서 렌더
export const notice = {
  noFlowers: '축하해 주시는 따뜻한 마음만으로 충분합니다.\n화환은 정중히 사양하오니 너른 양해 부탁드립니다.',
}

// 할로윈 이스터에그(결혼식이 10/31) — 커버의 신랑신부 이름을 3번 탭하면 등장하는 귀여운 감사 메시지.
// HalloweenOverlay.vue 에서 렌더. 문구만 바꾸면 됩니다.
export const halloween = {
  title: 'Trick or Treat! 🎃',
  message: ['와주셔서 고마워요 👻', '무서운 건 없고 행복만 가득할게요 💜'],
  sign: '현재 ❤ 지윤',
}

// 배경 음악 (BGM). /public/bgm 에 mp3 를 넣고 경로를 지정하세요. 사용 안 하면 src 를 null 로.
// ⚠️ 음원 파일은 직접 준비해야 합니다(저작권). 저작권 걱정 없는 곡 추천:
//   · 퍼블릭 도메인 클래식: Pachelbel - Canon in D, Bach - Air on the G String 등
//     (Musopen.org 등에서 CC0/퍼블릭 도메인 연주 음원 다운로드 가능)
//   · 또는 무료 BGM 사이트(예: Pixabay Music)의 라이선스 프리 곡
//   준비한 mp3 를 public/bgm/wedding-bgm.mp3 로 저장하면 우상단 버튼으로 재생됩니다.
export const bgm = {
  // 방문할 때마다 아래 목록 중 한 곡이 무작위로 재생됩니다.
  // 곡을 추가/제거하려면 public/bgm/ 에 mp3 를 넣고 이 배열만 수정하세요.
  tracks: [
    '/bgm/geoffharvey-best-adventure-ever-122726.mp3',
    '/bgm/geoffharvey-paved-with-gold-427881.mp3',
    '/bgm/olammusicali-dance-the-waltz-with-me-olam-musicali-297429.mp3',
    '/bgm/wedding-bgm.mp3',
  ],
}
