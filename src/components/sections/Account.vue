<script setup>
import { Copy } from '@lucide/vue'
import SectionTitle from '../ui/SectionTitle.vue'
import AccordionItem from '../ui/AccordionItem.vue'
import { accounts } from '../../data/invitation'

// 축의금 계좌 안내: 신랑측/신부측 아코디언 + 계좌번호 복사
async function copyAccount(acc) {
  try {
    await navigator.clipboard.writeText(acc.number.replace(/-/g, ''))
    alert(`${acc.bank} ${acc.number} 복사되었습니다.`)
  } catch {
    alert('복사에 실패했습니다. 직접 복사해 주세요.')
  }
}

const groups = [accounts.groom, accounts.bride]
</script>

<template>
  <section class="section">
    <SectionTitle label="Account" title="마음 전하실 곳" />

    <p class="mb-6 text-center text-sm leading-6 text-ink/70">
      참석이 어려우신 분들을 위해 계좌번호를 기재하였습니다.<br />
      너그러운 마음으로 양해 부탁드립니다.
    </p>

    <div class="space-y-3">
      <AccordionItem v-for="group in groups" :key="group.label" :title="group.label">
        <ul class="space-y-3">
          <li
            v-for="acc in group.list"
            :key="acc.number"
            class="flex items-center justify-between"
          >
            <div class="text-sm">
              <p class="text-ink/60">{{ acc.bank }}</p>
              <p class="text-ink">{{ acc.number }}</p>
              <p class="text-xs text-ink/50">예금주 {{ acc.holder }}</p>
            </div>
            <button
              class="inline-flex items-center gap-1 rounded-full border border-aurora-lilac/50 bg-white/60 px-3 py-1.5 text-xs text-ink/70 backdrop-blur transition active:scale-95"
              @click="copyAccount(acc)"
            >
              <Copy class="h-3.5 w-3.5" /> 복사
            </button>
          </li>
        </ul>
      </AccordionItem>
    </div>
  </section>
</template>
