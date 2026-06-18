<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown } from '@lucide/vue'
import FloatingPetals from '../ui/FloatingPetals.vue'
import { couple, wedding } from '../../data/invitation'
import { useCovers } from '../../composables/useCovers'

// 커버 사진 = 정적(coverImages) + 관리자 업로드(Firestore "covers")
const { images } = useCovers()

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
})

// SCROLL 클릭 → 다음 섹션으로 부드럽게 이동
function scrollNext() {
  document.getElementById('after-cover')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section class="relative h-[100dvh] min-h-[560px] overflow-hidden md:rounded-t-[2rem]">
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
          :loading="i < 2 ? 'eager' : 'lazy'"
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
        <h1 class="aurora-text-light cover-title whitespace-nowrap font-serif text-[2.75rem] font-extrabold leading-tight sm:text-5xl">
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
    <button
      type="button"
      class="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-float text-white/90"
      aria-label="아래로 스크롤"
      @click="scrollNext"
    >
      <span class="mb-1 block text-[10px] uppercase tracking-[0.3em]">Scroll</span>
      <ChevronDown class="mx-auto h-7 w-7" :stroke-width="1.5" />
    </button>
  </section>
</template>

<style scoped>
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
/* 활성 슬라이드에만 은은한 줌 */
.cover-slide.is-active img {
  animation: coverZoom 6s ease-out forwards;
  will-change: transform;
}
@keyframes coverZoom {
  from {
    transform: scale(1) translateZ(0);
  }
  to {
    transform: scale(1.07) translateZ(0);
  }
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

/* 접근성: 모션 줄이기 설정 시 줌/전환 정지 */
@media (prefers-reduced-motion: reduce) {
  .cover-slide {
    transition: none;
  }
  .cover-slide.is-active img {
    animation: none;
  }
}
</style>
