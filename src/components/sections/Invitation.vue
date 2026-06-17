<script setup>
import SectionTitle from '../ui/SectionTitle.vue'
import { couple, greeting } from '../../data/invitation'
</script>

<template>
  <section class="section text-center">
    <SectionTitle label="Invitation" :title="greeting.title" />

    <p class="space-y-1 font-serif text-[15px] leading-8 text-ink/80">
      <template v-for="(line, i) in greeting.message" :key="i">
        <span v-if="line" class="block">{{ line }}</span>
        <span v-else class="block h-4"></span>
      </template>
    </p>

    <div class="glass-card mx-auto mt-10 max-w-xs space-y-2 px-6 py-5 text-sm leading-7 text-ink/70">
      <p>
        <span class="text-ink/50">{{ couple.groom.father }} · {{ couple.groom.mother }}</span>
        의 {{ couple.groom.relation }}
        <span class="font-serif text-base text-ink">{{ couple.groom.shortName }}</span>
      </p>
      <p>
        <span class="text-ink/50">{{ couple.bride.father }} · {{ couple.bride.mother }}</span>
        의 {{ couple.bride.relation }}
        <span class="font-serif text-base text-ink">{{ couple.bride.shortName }}</span>
      </p>
    </div>
  </section>
</template>
