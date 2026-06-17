<script setup>
import { reactive, computed, ref } from 'vue'
import { MessageCircleHeart, Quote, PenLine, Trash2, CheckCircle2 } from '@lucide/vue'
import SectionTitle from '../ui/SectionTitle.vue'
import { useGuestbook } from '../../composables/useGuestbook'
import { useConfetti } from '../../composables/useConfetti'

// 방명록: Firestore "guestbook" 실시간 목록 + 작성 폼
const { entries, loading, submitting, addEntry, removeEntry, isMine } = useGuestbook()
const { celebrate } = useConfetti()

const form = reactive({ name: '', message: '' })

// 등록 성공 시 잠깐 떴다 사라지는 인라인 토스트
const toast = ref('')
let toastTimer = null
function showToast(text) {
  toast.value = text
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2600)
}

async function onSubmit() {
  if (!form.name.trim() || !form.message.trim()) {
    alert('이름과 축하 메시지를 입력해 주세요.')
    return
  }
  const ok = await addEntry({ name: form.name, message: form.message })
  if (ok) {
    form.name = ''
    form.message = ''
    celebrate()
    showToast('축하 메시지가 등록되었어요 💕')
  } else {
    alert('등록에 실패했습니다. 잠시 후 다시 시도해 주세요.')
  }
}

// 본인 글 삭제(기기 기록 기준)
async function onDelete(entry) {
  if (!confirm('이 축하 메시지를 삭제할까요?')) return
  const ok = await removeEntry(entry.id)
  if (!ok) alert('삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.')
}

function formatDate(d) {
  if (!d) return ''
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// 이름 첫 글자(아바타용)
const initial = (name) => (name?.trim()?.[0] ?? '♡')

// 아바타 색을 이름에 따라 일정하게 배정 (오로라 파스텔 4종)
const avatarGradients = [
  'linear-gradient(135deg,#f7a8c8,#eaa0b3)',
  'linear-gradient(135deg,#c4a9f0,#a78bee)',
  'linear-gradient(135deg,#8fc7f0,#7fb0e8)',
  'linear-gradient(135deg,#8ad9c0,#7fbfa8)',
]
const avatarColor = (name) => {
  const sum = [...(name || '♡')].reduce((a, c) => a + c.charCodeAt(0), 0)
  return avatarGradients[sum % avatarGradients.length]
}

const count = computed(() => entries.value.length)
</script>

<template>
  <section class="section">
    <SectionTitle label="Guestbook" title="축하 메시지" />

    <!-- 작성 폼 -->
    <form class="glass-card mb-8 space-y-3 p-5" @submit.prevent="onSubmit">
      <div class="flex items-center gap-2 text-sm font-medium text-rosewood-500">
        <PenLine class="h-4 w-4" />
        <span>두 사람에게 따뜻한 한마디를 남겨주세요</span>
      </div>
      <input
        v-model="form.name"
        type="text"
        placeholder="이름"
        maxlength="20"
        class="w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-rosewood-300 focus:bg-white"
      />
      <textarea
        v-model="form.message"
        rows="3"
        placeholder="따뜻한 축하의 말을 남겨주세요"
        maxlength="300"
        class="w-full resize-none rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-sm leading-6 outline-none transition focus:border-rosewood-300 focus:bg-white"
      ></textarea>
      <button type="submit" :disabled="submitting" class="aurora-btn w-full">
        <MessageCircleHeart class="h-4 w-4" />
        {{ submitting ? '등록 중...' : '축하 메시지 남기기' }}
      </button>

      <!-- 등록 성공 인라인 토스트 -->
      <transition name="toast">
        <p
          v-if="toast"
          class="flex items-center justify-center gap-1.5 rounded-xl bg-aurora-mint/20 py-2 text-sm font-medium text-rosewood-500"
        >
          <CheckCircle2 class="h-4 w-4" />
          {{ toast }}
        </p>
      </transition>
    </form>

    <!-- 메시지 개수 -->
    <p v-if="count" class="mb-4 text-center text-xs tracking-wide text-ink/50">
      지금까지 <span class="aurora-text font-bold">{{ count }}</span>개의 축하가 도착했어요
    </p>

    <!-- 목록 (v-auto-animate: 추가/정렬 시 부드러운 전환) -->
    <p v-if="loading" class="text-center text-sm text-ink/50">불러오는 중...</p>

    <div v-else-if="count === 0" class="glass-card flex flex-col items-center gap-2 px-6 py-10 text-center">
      <MessageCircleHeart class="h-9 w-9 text-rosewood-300" :stroke-width="1.5" />
      <p class="text-sm text-ink/60">아직 메시지가 없어요.</p>
      <p class="text-xs text-ink/40">첫 번째 축하 메시지를 남겨주세요 🤍</p>
    </div>

    <ul v-else v-auto-animate class="space-y-3">
      <li v-for="entry in entries" :key="entry.id" class="glass-card relative overflow-hidden p-4">
        <!-- 좌측 오로라 악센트 -->
        <span class="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-aurora-pink via-aurora-lilac to-aurora-mint" />
        <div class="flex gap-3">
          <!-- 아바타 -->
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-sm font-bold text-white shadow-sm"
            :style="{ backgroundImage: avatarColor(entry.name) }"
          >
            {{ initial(entry.name) }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-baseline justify-between gap-2">
              <span class="truncate font-serif text-sm font-semibold text-ink">{{ entry.name }}</span>
              <div class="flex shrink-0 items-center gap-2">
                <span class="text-[11px] text-ink/40">{{ formatDate(entry.createdAt) }}</span>
                <!-- 본인이 작성한 글에만 삭제 버튼 노출 -->
                <button
                  v-if="isMine(entry.id)"
                  type="button"
                  class="text-ink/30 transition hover:text-rosewood-400"
                  aria-label="내 메시지 삭제"
                  @click="onDelete(entry)"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div class="mt-1.5 flex gap-1.5">
              <Quote class="mt-0.5 h-3 w-3 shrink-0 text-aurora-lilac/70" />
              <p class="whitespace-pre-line text-sm leading-6 text-ink/75">{{ entry.message }}</p>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
/* 등록 성공 토스트 등장/퇴장 */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: opacity 0.3s ease;
  }
  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }
}
</style>
