<script setup>
import { Music, VolumeX } from '@lucide/vue'
import { useBgm } from '../composables/useBgm'
import { bgm } from '../data/invitation'

// 우상단 고정 BGM 토글 버튼 (음악 파일이 있을 때만 표시)
// bgm.tracks(여러 곡) 중 하나가 무작위로 재생된다. (구버전 bgm.src 도 호환)
const { playing, available, toggle } = useBgm(bgm.tracks || bgm.src)
</script>

<template>
  <button
    v-if="available"
    type="button"
    class="fixed right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/60 shadow-lg backdrop-blur-md transition active:scale-90"
    :class="{ 'animate-spin': playing }"
    :style="`top: max(1rem, env(safe-area-inset-top)); ${playing ? 'animation-duration: 4s' : ''}`"
    :aria-label="playing ? '음악 끄기' : '음악 켜기'"
    @click="toggle"
  >
    <Music v-if="playing" class="h-5 w-5 text-rosewood-400" />
    <VolumeX v-else class="h-5 w-5 text-ink/40" />
  </button>
</template>
