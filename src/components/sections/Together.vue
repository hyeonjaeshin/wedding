<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import SectionTitle from '../ui/SectionTitle.vue'
import { relationship } from '../../data/invitation'

// 두 사람이 함께한 시간 (연애 시작일 ~ 오늘)
const now = ref(Date.now())
let timer = null
onMounted(() => {
  timer = setInterval(() => (now.value = Date.now()), 1000)
})
onBeforeUnmount(() => clearInterval(timer))

const pad = (n) => String(n).padStart(2, '0')
const since = relationship?.sinceISO ? new Date(relationship.sinceISO) : null

const togetherDays = computed(() => {
  if (!since) return 0
  return Math.max(0, Math.floor((now.value - since.getTime()) / 86400000))
})
const togetherText = computed(() => {
  if (!since) return ''
  const d = new Date(since)
  const n = new Date(now.value)
  let years = n.getFullYear() - d.getFullYear()
  let months = n.getMonth() - d.getMonth()
  if (n.getDate() < d.getDate()) months -= 1
  if (months < 0) {
    years -= 1
    months += 12
  }
  const parts = []
  if (years > 0) parts.push(`${years}년`)
  if (months > 0) parts.push(`${months}개월`)
  return parts.join(' ')
})
const comma = (n) => n.toLocaleString('ko-KR')
const sinceLabel = since
  ? `${since.getFullYear()}.${pad(since.getMonth() + 1)}.${pad(since.getDate())}`
  : ''
</script>

<template>
  <section v-if="since" class="section text-center">
    <SectionTitle label="Since" title="우리가 함께한 시간" />

    <p class="text-[11px] uppercase tracking-[0.3em] text-sage-600">{{ sinceLabel }}</p>
    <p class="mt-3 font-serif text-lg leading-none text-ink/80">
      함께한 지
      <span class="aurora-text align-baseline text-[2.5rem] font-bold tabular-nums">{{ comma(togetherDays) }}</span>
      일
    </p>
    <p v-if="togetherText" class="mt-3 text-sm tracking-wide text-ink/50">
      {{ togetherText }} 동안, 변함없이 🤍
    </p>
  </section>
</template>
