<script setup>
import { reactive } from 'vue'
import { Check, X, Send } from '@lucide/vue'
import SectionTitle from '../ui/SectionTitle.vue'
import { useRsvp } from '../../composables/useRsvp'
import { useConfetti } from '../../composables/useConfetti'

// 참석 여부 전달 폼 → Firestore "rsvp"
const { submitting, submitted, submit } = useRsvp()
const { celebrate } = useConfetti()

const form = reactive({
  side: '신랑측',
  attending: 'yes',
  name: '',
  count: 1,
  meal: 'yes',
  memo: '',
})

async function onSubmit() {
  if (!form.name.trim()) {
    alert('성함을 입력해 주세요.')
    return
  }
  const ok = await submit(form)
  if (ok) celebrate()
  else alert('전송에 실패했습니다. 잠시 후 다시 시도해 주세요.')
}
</script>

<template>
  <section class="section">
    <SectionTitle label="R.S.V.P" title="참석 여부 전달" />

    <p class="mb-6 text-center text-sm leading-6 text-ink/70">
      축하의 마음으로 참석해 주시는 분들을 위해<br />
      참석 여부를 미리 알려주시면 감사하겠습니다.
    </p>

    <div v-if="submitted" class="glass-card p-8 text-center">
      <p class="text-3xl">💌</p>
      <p class="mt-3 font-serif text-lg text-ink">전달이 완료되었습니다</p>
      <p class="mt-1 text-sm text-ink/60">소중한 마음 감사합니다.</p>
    </div>

    <form v-else class="glass-card space-y-5 p-6" @submit.prevent="onSubmit">
      <!-- 신랑측 / 신부측 -->
      <div>
        <p class="mb-2 text-xs font-medium tracking-wide text-ink/50">어느 쪽 하객이신가요?</p>
        <div class="grid grid-cols-2 gap-2">
          <label
            v-for="s in ['신랑측', '신부측']"
            :key="s"
            class="cursor-pointer rounded-xl border py-3 text-center text-sm transition"
            :class="form.side === s
              ? 'border-rosewood-300 bg-gradient-to-r from-aurora-pink/25 to-aurora-lilac/25 font-semibold text-rosewood-500'
              : 'border-white/70 bg-white/60 text-ink/55'"
          >
            <input v-model="form.side" type="radio" :value="s" class="hidden" />
            {{ s }}
          </label>
        </div>
      </div>

      <!-- 참석 여부 -->
      <div>
        <p class="mb-2 text-xs font-medium tracking-wide text-ink/50">참석 여부</p>
        <div class="grid grid-cols-2 gap-2">
          <label
            v-for="opt in [{ v: 'yes', t: '참석할게요' }, { v: 'no', t: '어려울 것 같아요' }]"
            :key="opt.v"
            class="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-3 text-center text-sm transition"
            :class="form.attending === opt.v
              ? 'border-sage-400 bg-sage-400/15 font-semibold text-sage-600'
              : 'border-white/70 bg-white/60 text-ink/55'"
          >
            <input v-model="form.attending" type="radio" :value="opt.v" class="hidden" />
            <component :is="opt.v === 'yes' ? Check : X" class="h-4 w-4" />
            {{ opt.t }}
          </label>
        </div>
      </div>

      <!-- 성함 -->
      <div>
        <p class="mb-2 text-xs font-medium tracking-wide text-ink/50">성함</p>
        <input
          v-model="form.name"
          type="text"
          placeholder="성함을 입력해 주세요"
          maxlength="20"
          class="w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-rosewood-300 focus:bg-white"
        />
      </div>

      <!-- 인원 / 식사 (참석일 때만) -->
      <div v-if="form.attending === 'yes'" class="grid grid-cols-2 gap-3">
        <div>
          <p class="mb-2 text-xs font-medium tracking-wide text-ink/50">참석 인원</p>
          <input
            v-model.number="form.count"
            type="number"
            min="1"
            max="20"
            class="w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-rosewood-300 focus:bg-white"
          />
        </div>
        <div>
          <p class="mb-2 text-xs font-medium tracking-wide text-ink/50">식사 여부</p>
          <select
            v-model="form.meal"
            class="w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-rosewood-300 focus:bg-white"
          >
            <option value="yes">식사함</option>
            <option value="no">식사안함</option>
            <option value="undecided">미정</option>
          </select>
        </div>
      </div>

      <!-- 전달 사항 -->
      <div>
        <p class="mb-2 text-xs font-medium tracking-wide text-ink/50">전달 사항 (선택)</p>
        <textarea
          v-model="form.memo"
          rows="2"
          placeholder="신랑신부에게 전할 말씀이 있다면 남겨주세요"
          maxlength="200"
          class="w-full resize-none rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-sm leading-6 outline-none transition focus:border-rosewood-300 focus:bg-white"
        ></textarea>
      </div>

      <button type="submit" :disabled="submitting" class="aurora-btn w-full">
        <Send class="h-4 w-4" />
        {{ submitting ? '전송 중...' : '참석 여부 전달하기' }}
      </button>
    </form>
  </section>
</template>
