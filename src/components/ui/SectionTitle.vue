<script setup>
import { Sparkles } from '@lucide/vue'

// 섹션 제목 (영문 라벨 + 한글 제목 + 오로라 그라데이션)
defineProps({
  label: { type: String, default: '' },
  title: { type: String, default: '' },
})
</script>

<template>
  <div class="mb-8 text-center">
    <p
      v-if="label"
      class="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-sage-600"
    >
      <Sparkles class="h-3.5 w-3.5 text-aurora-lilac" />
      {{ label }}
      <Sparkles class="h-3.5 w-3.5 text-aurora-lilac" />
    </p>
    <h2 v-if="title" class="aurora-text block font-serif text-2xl font-bold">{{ title }}</h2>
    <div class="aurora-divider mx-auto mt-4 w-16" />
  </div>
</template>
