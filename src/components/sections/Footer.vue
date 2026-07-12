<script setup>
import { onMounted, ref } from 'vue'
import { Link2, Share2 } from '@lucide/vue'
import QRCodeStyling from 'qr-code-styling'
import { couple, wedding, siteUrl, relationship } from '../../data/invitation'

// 'YYYY-MM-DD...' → 'YYYY. MM. DD' 로 표기
const fmtDate = (iso) => {
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${y}. ${m}. ${d}`
}
const sinceText = fmtDate(relationship.sinceISO)
const weddingDate = fmtDate(wedding.dateISO)

// 오로라 톤 하트 QR — 가운데에 놓을 하트 로고(SVG data URL, 오로라 그라데이션)
const heartLogo =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 29'>
      <defs><linearGradient id='h' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#f7a8c8'/>
        <stop offset='0.5' stop-color='#c4a9f0'/>
        <stop offset='1' stop-color='#8ad9c0'/>
      </linearGradient></defs>
      <path fill='url(#h)' d='M16 29S3 20 3 10.5C3 5.8 6.8 2 11.5 2 14 2 16 4.3 16 4.3S18 2 20.5 2C25.2 2 29 5.8 29 10.5 29 20 16 29 16 29z'/>
    </svg>`,
  )

// 청첩장 QR 코드를 마운트할 컨테이너
const qrBox = ref(null)

onMounted(() => {
  if (!qrBox.value) return
  // QR 은 항상 실제 배포 주소를 가리킨다(로컬/미리보기에서 봐도 동일).
  const qr = new QRCodeStyling({
    width: 160,
    height: 160,
    type: 'svg',
    data: siteUrl,
    image: heartLogo,
    qrOptions: { errorCorrectionLevel: 'H' }, // 중앙 하트 가려도 스캔되도록 최고 복원도
    imageOptions: { imageSize: 0.24, margin: 4, hideBackgroundDots: true },
    dotsOptions: {
      type: 'rounded',
      gradient: {
        type: 'linear',
        rotation: 0.79, // 약 45°
        colorStops: [
          { offset: 0, color: '#f7a8c8' },
          { offset: 0.5, color: '#c4a9f0' },
          { offset: 1, color: '#8ad9c0' },
        ],
      },
    },
    cornersSquareOptions: { type: 'extra-rounded', color: '#c4a9f0' },
    cornersDotOptions: { type: 'dot', color: '#f7a8c8' },
    backgroundOptions: { color: 'transparent' },
  })
  qr.append(qrBox.value)
})

// 청첩장 링크 공유 (URL 복사)
async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    alert('청첩장 링크가 복사되었습니다.')
  } catch {
    alert('복사에 실패했습니다.')
  }
}

// Web Share API 지원 시 네이티브 공유
const canShare = typeof navigator !== 'undefined' && !!navigator.share
async function share() {
  try {
    await navigator.share({
      title: `${couple.groom.shortName} ❤ ${couple.bride.shortName} 결혼합니다`,
      text: wedding.dateText,
      url: window.location.href,
    })
  } catch {
    /* 사용자가 취소한 경우 등은 무시 */
  }
}
</script>

<template>
  <footer class="section pb-12 text-center">
    <p class="aurora-text inline-block font-serif text-2xl font-bold">
      {{ couple.groom.shortName }} &amp; {{ couple.bride.shortName }}
    </p>
    <p class="mt-3 text-sm text-ink/60">{{ wedding.dateText }}</p>
    <p class="mt-1 text-sm text-ink/60">{{ wedding.venue.name }} {{ wedding.venue.hall }}</p>

    <!-- 청첩장 QR 코드 (오로라 톤 · 중앙 하트) -->
    <div class="mt-8 flex flex-col items-center gap-2">
      <div
        ref="qrBox"
        class="flex h-40 w-40 items-center justify-center rounded-2xl bg-white p-2.5 shadow-lg ring-1 ring-white/60"
        aria-label="청첩장 QR 코드"
      ></div>
      <p class="text-xs text-ink/45">QR 코드로 청첩장을 전해보세요</p>
    </div>

    <div class="mt-7 flex justify-center gap-2">
      <button class="aurora-btn" @click="copyLink">
        <Link2 class="h-4 w-4" /> 링크 복사하기
      </button>
      <button v-if="canShare" class="aurora-btn-outline" @click="share">
        <Share2 class="h-4 w-4" /> 공유하기
      </button>
    </div>

    <div class="mt-12">
      <p class="font-serif text-lg text-ink/70">
        {{ couple.groom.shortName }} <span class="aurora-text font-medium">♥</span> {{ couple.bride.shortName }}
      </p>
      <p class="mt-2 flex items-center justify-center gap-2 text-[11px] tracking-[0.12em] text-ink/40">
        <span>{{ sinceText }}</span>
        <span class="text-aurora-lilac">→</span>
        <span>{{ weddingDate }}</span>
      </p>
    </div>
  </footer>
</template>
