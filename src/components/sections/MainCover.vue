<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown } from '@lucide/vue'
import FloatingPetals from '../ui/FloatingPetals.vue'
import { couple, wedding, coverImages } from '../../data/invitation'

// 첫 화면 커버: 사진이 일정 간격으로 페이드 전환되는 슬라이드쇼
const current = ref(0)
const interval = 5000 // 5초마다 전환
let timer = null

onMounted(() => {
  if (coverImages.length > 1) {
    timer = setInterval(() => {
      current.value = (current.value + 1) % coverImages.length
    }, interval)
  }
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <section class="relative flex h-[100dvh] min-h-[560px] items-center justify-center overflow-hidden md:rounded-t-[2rem]">
    <!-- 배경 슬라이드쇼 -->
    <div class="absolute inset-0">
      <transition-group name="cover-fade">
        <div
          v-for="(img, i) in coverImages"
          v-show="i === current"
          :key="img"
          class="absolute inset-0 animate-slowZoom bg-cover bg-center"
          :style="{ backgroundImage: `url(${img})` }"
        />
      </transition-group>
      <!-- 가독성을 위한 그라데이션 오버레이 (상·하단 어둡게) + 은은한 비네트 -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/55" />
      <div class="cover-vignette absolute inset-0" />
    </div>

    <!-- 떠다니는 반짝임 파티클 -->
    <FloatingPetals :count="18" variant="sparkle" />

    <!-- 텍스트 오버레이 -->
    <div class="relative z-10 px-6 text-center text-white">
      <p class="mb-6 text-xs font-light uppercase tracking-[0.35em] text-glow opacity-95 sm:text-sm">
        We're getting married
      </p>

      <h1 class="aurora-text-light cover-title whitespace-nowrap font-serif text-[2.75rem] font-extrabold leading-tight sm:text-5xl">
        {{ couple.groom.shortName }}
        <span class="px-1">&amp;</span>
        {{ couple.bride.shortName }}
      </h1>

      <div class="aurora-divider mx-auto my-7 w-20 opacity-90" />

      <p class="text-glow text-base font-light tracking-wide">{{ wedding.dateText }}</p>
      <p class="text-glow mt-1 text-sm font-light opacity-95">
        {{ wedding.venue.name }} {{ wedding.venue.hall }}
      </p>
    </div>

    <!-- 스크롤 인디케이터 -->
    <div class="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-float text-white/90">
      <span class="mb-1 block text-[10px] uppercase tracking-[0.3em]">Scroll</span>
      <ChevronDown class="mx-auto h-7 w-7" :stroke-width="1.5" />
    </div>
  </section>
</template>

<style scoped>
.cover-fade-enter-active,
.cover-fade-leave-active {
  transition: opacity 1.2s ease-in-out;
}
.cover-fade-enter-from,
.cover-fade-leave-to {
  opacity: 0;
}

/* 가장자리를 부드럽게 어둡게 하는 비네트 */
.cover-vignette {
  background: radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0, 0, 0, 0.4) 100%);
}

/* 커버 제목 글로우 (그라데이션 글자는 text-shadow 대신 drop-shadow 필터 사용) */
.cover-title {
  filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.45));
}

.text-glow {
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
}
</style>
