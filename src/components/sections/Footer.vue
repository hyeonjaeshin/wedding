<script setup>
import { Link2, Share2 } from '@lucide/vue'
import { couple, wedding } from '../../data/invitation'

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

    <div class="mt-7 flex justify-center gap-2">
      <button class="aurora-btn" @click="copyLink">
        <Link2 class="h-4 w-4" /> 링크 복사하기
      </button>
      <button v-if="canShare" class="aurora-btn-outline" @click="share">
        <Share2 class="h-4 w-4" /> 공유하기
      </button>
    </div>

    <p class="mt-10 text-[11px] text-ink/30">made with ♥ — 모바일 청첩장</p>
  </footer>
</template>
