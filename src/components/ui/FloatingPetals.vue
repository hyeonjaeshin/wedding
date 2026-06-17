<script setup>
// 떠다니는 꽃잎/반짝임 장식 레이어 (순수 CSS 애니메이션, 상호작용 없음)
// 커버·배경에 생동감을 더한다. prefers-reduced-motion 시 style.css 에서 정지.
import { computed } from 'vue'

const props = defineProps({
  count: { type: Number, default: 14 },
  // 'petal'(꽃잎, 둥근 그라데이션) | 'sparkle'(작은 점)
  variant: { type: String, default: 'petal' },
})

// 각 입자에 무작위 위치/지연/크기/지속시간 부여
const particles = computed(() =>
  Array.from({ length: props.count }, (_, i) => {
    const size = props.variant === 'sparkle' ? 3 + Math.random() * 4 : 8 + Math.random() * 14
    return {
      id: i,
      left: Math.random() * 100,
      size,
      delay: -(Math.random() * 14),
      duration: 10 + Math.random() * 12,
      drift: (Math.random() * 2 - 1) * 40,
      opacity: 0.35 + Math.random() * 0.4,
    }
  })
)
</script>

<template>
  <div class="petal-layer pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <span
      v-for="p in particles"
      :key="p.id"
      class="petal"
      :class="variant"
      :style="{
        left: p.left + '%',
        width: p.size + 'px',
        height: p.size + 'px',
        opacity: p.opacity,
        '--drift': p.drift + 'px',
        animationDelay: p.delay + 's',
        animationDuration: p.duration + 's',
      }"
    />
  </div>
</template>

<style scoped>
.petal {
  position: absolute;
  top: -8%;
  border-radius: 9999px;
  animation-name: petalFall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform, opacity;
}
.petal.petal {
  background: radial-gradient(circle at 30% 30%, #ffffff, #f7a8c8 55%, #c4a9f0);
  box-shadow: 0 0 6px rgba(199, 169, 240, 0.5);
}
.petal.sparkle {
  background: radial-gradient(circle, #ffffff 0%, rgba(255, 255, 255, 0) 70%);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}

@keyframes petalFall {
  0% {
    transform: translate3d(0, -10vh, 0) rotate(0deg);
  }
  100% {
    transform: translate3d(var(--drift), 120vh, 0) rotate(320deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .petal {
    animation: none;
    display: none;
  }
}
</style>
