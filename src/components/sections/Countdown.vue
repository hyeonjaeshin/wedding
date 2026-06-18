<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Heart } from '@lucide/vue'
import { couple, wedding, relationship } from '../../data/invitation'

// 예식까지 남은 시간(D-day) 카운트다운
const now = ref(Date.now())
const target = new Date(wedding.dateISO).getTime()
let timer = null

onMounted(() => {
  timer = setInterval(() => (now.value = Date.now()), 1000)
})
onBeforeUnmount(() => clearInterval(timer))

const diff = computed(() => Math.max(0, target - now.value))
const days = computed(() => Math.floor(diff.value / 86400000))
const hours = computed(() => Math.floor((diff.value % 86400000) / 3600000))
const minutes = computed(() => Math.floor((diff.value % 3600000) / 60000))
const seconds = computed(() => Math.floor((diff.value % 60000) / 1000))

const units = computed(() => [
  { label: 'DAYS', value: days.value },
  { label: 'HOUR', value: hours.value },
  { label: 'MIN', value: minutes.value },
  { label: 'SEC', value: seconds.value },
])

const pad = (n) => String(n).padStart(2, '0')

// 함께한 시간 (연애 시작일 ~ 오늘): 총 일수 + n년 n개월
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
  <section class="section text-center">
    <div class="mb-7 flex items-center justify-center gap-2.5">
      <span class="font-serif text-lg text-ink">{{ couple.groom.shortName }}</span>
      <Heart class="h-5 w-5 animate-float fill-rosewood-400 text-rosewood-400" />
      <span class="font-serif text-lg text-ink">{{ couple.bride.shortName }}</span>
    </div>

    <div class="mx-auto flex max-w-xs justify-between gap-2">
      <div
        v-for="u in units"
        :key="u.label"
        class="glass-card flex-1 px-1 py-3"
      >
        <div class="aurora-text font-serif text-3xl font-bold tabular-nums">{{ pad(u.value) }}</div>
        <div class="mt-1 text-[10px] tracking-widest text-sage-600">{{ u.label }}</div>
      </div>
    </div>

    <p class="mt-7 text-sm text-ink/70">
      결혼식이 <span class="aurora-text font-bold">{{ days }}</span>일 남았습니다.
    </p>

    <!-- 함께한 시간 (D-day 카드와 다른 에디토리얼 스타일) -->
    <div v-if="since" class="mt-10">
      <div class="aurora-divider mx-auto mb-5 w-12 opacity-80" />
      <p class="text-[11px] uppercase tracking-[0.3em] text-sage-600">Since {{ sinceLabel }}</p>
      <p class="mt-2.5 font-serif text-lg leading-none text-ink/80">
        함께한 지
        <span class="aurora-text align-baseline text-[2rem] font-bold tabular-nums">{{ comma(togetherDays) }}</span>
        일
      </p>
      <p v-if="togetherText" class="mt-2 text-xs tracking-wide text-ink/45">
        {{ togetherText }} 동안, 변함없이 🤍
      </p>
    </div>
  </section>
</template>
