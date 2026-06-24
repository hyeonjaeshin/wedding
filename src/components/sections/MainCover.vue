<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown } from '@lucide/vue'
import FloatingPetals from '../ui/FloatingPetals.vue'
import HalloweenOverlay from '../ui/HalloweenOverlay.vue'
import { couple, wedding } from '../../data/invitation'
import { useCovers } from '../../composables/useCovers'
import { useConfetti } from '../../composables/useConfetti'

// 커버 사진 = 정적(coverImages) + 관리자 업로드(Firestore "covers")
const { images } = useCovers()

// 할로윈 이스터에그: 신랑신부 이름을 3번 톡톡 탭하면 발동(평소엔 아무 표시 없음)
const { halloween: fireHalloween } = useConfetti()
const boo = ref(false)
let tapCount = 0
let tapTimer = null
let booTimer = null
function onNameTap() {
  tapCount += 1
  clearTimeout(tapTimer)
  tapTimer = setTimeout(() => (tapCount = 0), 1200)
  if (tapCount >= 3) {
    tapCount = 0
    if (boo.value) return // 재생 중 중복 방지
    fireHalloween()
    boo.value = true
    clearTimeout(booTimer)
    booTimer = setTimeout(() => (boo.value = false), 5000)
  }
}

// 첫 화면 커버: 사진이 일정 간격으로 페이드 전환되는 슬라이드쇼
const current = ref(0)
const interval = 5000 // 5초마다 전환
let timer = null

// 모바일은 파티클 수를 줄여 전환 부담 감소
const petalCount = typeof window !== 'undefined' && window.innerWidth < 640 ? 8 : 16

onMounted(() => {
  timer = setInterval(() => {
    const n = images.value.length
    if (n > 1) current.value = (current.value + 1) % n
  }, interval)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  clearTimeout(tapTimer)
  clearTimeout(booTimer)
})

// SCROLL 클릭 → 다음 섹션으로 부드럽게 이동
function scrollNext() {
  document.getElementById('after-cover')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section class="cover-section relative overflow-hidden md:rounded-t-[2rem]">
    <!-- 배경 슬라이드쇼 (opacity 전환 + 활성 슬라이드만 줌, GPU 합성) -->
    <div class="absolute inset-0">
      <!-- 업로드된 커버가 없을 때 오로라 그라데이션 폴백 -->
      <div
        v-if="!images.length"
        class="absolute inset-0 bg-gradient-to-br from-aurora-pink via-aurora-lilac to-aurora-blue"
      />
      <div
        v-for="(img, i) in images"
        :key="`${img}-${i}`"
        class="cover-slide"
        :class="{ 'is-active': i === current }"
      >
        <img
          :src="img"
          alt=""
          :loading="i === 0 ? 'eager' : 'lazy'"
          :fetchpriority="i === 0 ? 'high' : 'auto'"
          decoding="async"
          class="h-full w-full object-cover"
        />
      </div>
      <!-- 가독성용 그라데이션 + 비네트 -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/55" />
      <div class="cover-vignette absolute inset-0" />
    </div>

    <!-- 떠다니는 반짝임 파티클 -->
    <FloatingPetals :count="petalCount" variant="sparkle" />

    <!-- 텍스트 오버레이: 이름은 위쪽, 날짜·장소는 아래쪽 -->
    <div class="relative z-10 flex h-full flex-col items-center px-6 pb-28 pt-[22vh] text-center text-white">
      <!-- 상단 그룹: 인사 + 신랑신부 이름 -->
      <div>
        <p class="text-glow mb-6 text-xs font-light uppercase tracking-[0.35em] opacity-95 sm:text-sm">
          We're getting married
        </p>
        <h1
          class="aurora-text-light cover-title select-none whitespace-nowrap font-serif text-[2.75rem] font-extrabold leading-tight sm:text-5xl"
          @click="onNameTap"
        >
          {{ couple.groom.shortName }}
          <span class="px-1">&amp;</span>
          {{ couple.bride.shortName }}
        </h1>
      </div>

      <!-- 하단 그룹: 날짜 · 장소 -->
      <div class="mt-auto">
        <div class="aurora-divider mx-auto mb-7 w-20 opacity-90" />
        <p class="text-glow text-base font-light tracking-wide">{{ wedding.dateText }}</p>
        <p class="text-glow mt-1 text-sm font-light opacity-95">
          {{ wedding.venue.name }} {{ wedding.venue.hall }}
        </p>
      </div>
    </div>

    <!-- 스크롤 버튼 (클릭 시 다음 섹션으로) -->
    <!-- inset-x-0 + items-center 로 화면 정중앙 정렬 (animate-float 의 translateY 와 transform 충돌 없음) -->
    <button
      type="button"
      class="absolute bottom-8 inset-x-0 z-10 flex animate-float flex-col items-center text-white/90"
      aria-label="아래로 스크롤"
      @click="scrollNext"
    >
      <!-- pl 로 letter-spacing 의 우측 여백을 보정(글자 중앙) -->
      <span class="mb-1 block pl-[0.3em] text-center text-[10px] uppercase tracking-[0.3em]">Scroll</span>
      <ChevronDown class="h-7 w-7" :stroke-width="1.5" />
    </button>

    <!-- 할로윈 이스터에그 오버레이(이름 3번 탭 시) -->
    <HalloweenOverlay :active="boo" />
  </section>
</template>

<style scoped>
/* 커버 높이: svh(작은 뷰포트) 사용 → 모바일에서 주소창 숨김/표시로 인한 높이(=이미지 크기) 변동 제거.
   dvh 와 달리 svh/lvh 는 스크롤 중 값이 변하지 않는다. 미지원 브라우저는 100vh 폴백. */
.cover-section {
  height: 100vh;
  height: 100svh;
  min-height: 560px;
}

/* 슬라이드: opacity 전환만(레이아웃/리페인트 최소화), GPU 합성 */
.cover-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
  will-change: opacity;
}
.cover-slide.is-active {
  opacity: 1;
}
.cover-slide img {
  transform: translateZ(0);
  backface-visibility: hidden;
}

.cover-vignette {
  background: radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0, 0, 0, 0.4) 100%);
}
.cover-title {
  filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.45));
}
.text-glow {
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
}

/* 접근성: 모션 줄이기 설정 시 전환 정지 */
@media (prefers-reduced-motion: reduce) {
  .cover-slide {
    transition: none;
  }
}
</style>
