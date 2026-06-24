<script setup>
// 할로윈 이스터에그 오버레이 (커버 이름 3번 탭 시 등장).
// 모두 pointer-events-none · 유한 애니메이션 · 일정 시간 후 부모가 active=false 로 자동 종료.
import { ref, watch } from 'vue'
import { halloween } from '../../data/invitation'

const props = defineProps({
  active: { type: Boolean, default: false },
})

const EMOJIS = ['🎃', '👻', '🦇', '🍬', '⭐', '🌙']
const particles = ref([])

function generate() {
  return Array.from({ length: 24 }, (_, i) => {
    const float = i % 4 === 0 // 일부(👻)는 아래→위로 둥실
    return {
      id: `${Date.now()}-${i}`,
      emoji: float ? '👻' : EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      left: Math.random() * 96,
      size: 22 + Math.random() * 20,
      delay: Math.random() * 0.8,
      duration: 3.8 + Math.random() * 1.6,
      drift: (Math.random() * 2 - 1) * 60,
      float,
    }
  })
}

// 발동될 때마다 새로 랜덤 생성
watch(
  () => props.active,
  (v) => {
    if (v) particles.value = generate()
  },
  { immediate: true }
)
</script>

<template>
  <Teleport to="body">
    <transition name="boo">
      <div v-if="active" class="boo-layer pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden="true">
        <!-- 은은한 호박빛 틴트 -->
        <div class="boo-tint absolute inset-0" />

        <!-- 떠다니는 이모지 -->
        <span
          v-for="p in particles"
          :key="p.id"
          class="boo-emoji"
          :class="{ 'is-float': p.float }"
          :style="{
            left: p.left + '%',
            fontSize: p.size + 'px',
            '--drift': p.drift + 'px',
            animationDelay: p.delay + 's',
            animationDuration: p.duration + 's',
          }"
          >{{ p.emoji }}</span
        >

        <!-- 귀여운 감사 메시지 카드 -->
        <div class="absolute inset-0 flex items-center justify-center px-8">
          <div class="boo-card glass-card max-w-xs px-7 py-6 text-center">
            <p class="font-serif text-xl font-bold text-rosewood-500">{{ halloween.title }}</p>
            <p
              v-for="(line, i) in halloween.message"
              :key="i"
              class="mt-2 text-sm leading-7 text-ink/80"
            >
              {{ line }}
            </p>
            <p v-if="halloween.sign" class="mt-3 font-serif text-sm text-ink/55">{{ halloween.sign }}</p>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
/* 오버레이 전체 페이드 */
.boo-enter-active,
.boo-leave-active {
  transition: opacity 0.5s ease;
}
.boo-enter-from,
.boo-leave-to {
  opacity: 0;
}

/* 호박빛 틴트(한 번 부드럽게 펄스) */
.boo-tint {
  background: radial-gradient(60% 50% at 50% 45%, rgba(255, 150, 60, 0.16), transparent 70%);
  animation: tintPulse 2.4s ease-out forwards;
}
@keyframes tintPulse {
  0% { opacity: 0; }
  35% { opacity: 1; }
  100% { opacity: 0; }
}

/* 이모지 입자 — 유한(1회) 애니메이션 */
.boo-emoji {
  position: absolute;
  top: -12vh;
  line-height: 1;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.18));
  animation-name: booFall;
  animation-timing-function: ease-in;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  will-change: transform, opacity;
}
.boo-emoji.is-float {
  top: auto;
  bottom: -12vh;
  animation-name: booFloat;
  animation-timing-function: ease-out;
}
@keyframes booFall {
  0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
  12% { opacity: 1; }
  88% { opacity: 1; }
  100% { transform: translate3d(var(--drift), 124vh, 0) rotate(300deg); opacity: 0; }
}
@keyframes booFloat {
  0% { transform: translate3d(0, 0, 0); opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { transform: translate3d(var(--drift), -124vh, 0); opacity: 0; }
}

/* 감사 카드 — 살짝 떠오르며 등장 */
.boo-card {
  animation: cardIn 0.5s ease-out both;
  box-shadow: 0 16px 40px -12px rgba(196, 169, 240, 0.6);
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* 접근성: 모션 최소화 시 입자/틴트 정지, 카드는 표시(문구가 핵심) */
@media (prefers-reduced-motion: reduce) {
  .boo-emoji,
  .boo-tint {
    display: none;
  }
  .boo-card {
    animation: none;
  }
}
</style>
