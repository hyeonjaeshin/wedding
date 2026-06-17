<script setup>
import { ref } from 'vue'
import { ChevronDown } from '@lucide/vue'

// 접기/펼치기(아코디언) 한 항목
defineProps({
  title: { type: String, required: true },
})

const open = ref(false)
</script>

<template>
  <div class="glass-card overflow-hidden">
    <button
      type="button"
      class="flex w-full items-center justify-between px-5 py-4 text-left"
      @click="open = !open"
    >
      <span class="font-serif text-base text-ink">{{ title }}</span>
      <ChevronDown
        class="h-5 w-5 text-sage-600 transition-transform duration-300"
        :class="{ 'rotate-180': open }"
      />
    </button>
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-96 opacity-100"
      leave-from-class="max-h-96 opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-show="open" class="overflow-hidden">
        <div class="border-t border-white/60 px-5 py-4">
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>
