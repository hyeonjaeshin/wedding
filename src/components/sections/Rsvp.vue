<script setup>
import { reactive } from 'vue'
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

    <form v-else class="glass-card space-y-4 p-5" @submit.prevent="onSubmit">
      <!-- 신랑측 / 신부측 -->
      <div class="flex gap-2">
        <label
          v-for="s in ['신랑측', '신부측']"
          :key="s"
          class="flex-1 cursor-pointer rounded-lg border py-2.5 text-center text-sm transition"
          :class="form.side === s ? 'border-rosewood-400 bg-rosewood-300/20 text-rosewood-500' : 'border-cream-200 bg-white text-ink/60'"
        >
          <input v-model="form.side" type="radio" :value="s" class="hidden" />
          {{ s }}
        </label>
      </div>

      <!-- 참석 여부 -->
      <div class="flex gap-2">
        <label
          v-for="opt in [{ v: 'yes', t: '참석' }, { v: 'no', t: '불참' }]"
          :key="opt.v"
          class="flex-1 cursor-pointer rounded-lg border py-2.5 text-center text-sm transition"
          :class="form.attending === opt.v ? 'border-sage-500 bg-sage-400/15 text-sage-600' : 'border-cream-200 bg-white text-ink/60'"
        >
          <input v-model="form.attending" type="radio" :value="opt.v" class="hidden" />
          {{ opt.t }}
        </label>
      </div>

      <input
        v-model="form.name"
        type="text"
        placeholder="성함"
        maxlength="20"
        class="w-full rounded-lg border border-cream-200 bg-white px-4 py-3 text-sm outline-none focus:border-sage-400"
      />

      <div class="flex gap-3">
        <div class="flex-1">
          <label class="mb-1 block text-xs text-ink/50">참석 인원</label>
          <input
            v-model.number="form.count"
            type="number"
            min="1"
            max="20"
            class="w-full rounded-lg border border-cream-200 bg-white px-4 py-3 text-sm outline-none focus:border-sage-400"
          />
        </div>
        <div class="flex-1">
          <label class="mb-1 block text-xs text-ink/50">식사 여부</label>
          <select
            v-model="form.meal"
            class="w-full rounded-lg border border-cream-200 bg-white px-4 py-3 text-sm outline-none focus:border-sage-400"
          >
            <option value="yes">식사함</option>
            <option value="no">식사안함</option>
            <option value="undecided">미정</option>
          </select>
        </div>
      </div>

      <textarea
        v-model="form.memo"
        rows="2"
        placeholder="전달 사항 (선택)"
        maxlength="200"
        class="w-full resize-none rounded-lg border border-cream-200 bg-white px-4 py-3 text-sm outline-none focus:border-sage-400"
      ></textarea>

      <button type="submit" :disabled="submitting" class="aurora-btn w-full">
        {{ submitting ? '전송 중...' : '참석 여부 전달하기' }}
      </button>
    </form>
  </section>
</template>
