<script setup>
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import { Camera, X, ChevronLeft, ChevronRight, Trash2, LoaderCircle, Images } from '@lucide/vue'
import SectionTitle from '../ui/SectionTitle.vue'
import { useGuestsnap } from '../../composables/useGuestsnap'
import { useImageCompress } from '../../composables/useImageCompress'
import { useConfetti } from '../../composables/useConfetti'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const lightboxModules = [Navigation, Pagination]

// 게스트스냅: 하객 누구나 사진을 올리고 함께 보는 공간(공개)
const { items, uploadSnaps, removeMine, isMine } = useGuestsnap()
const { compress } = useImageCompress()
const { celebrate } = useConfetti()

const busy = ref(false)
const dragging = ref(false)
const toast = ref('')
let toastTimer = null
function showToast(t) {
  toast.value = t
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2600)
}

async function handleFiles(fileList) {
  const files = Array.from(fileList || []).filter(
    (f) => (f.type || '').startsWith('image/') || /\.(heic|heif)$/i.test(f.name)
  )
  if (!files.length) return
  busy.value = true
  const dataUrls = []
  const errors = []
  for (const f of files) {
    try {
      const { dataUrl } = await compress(f, { maxDim: 1200, quality: 0.72, maxBytes: 300 * 1024 })
      dataUrls.push(dataUrl)
    } catch {
      errors.push(f.name)
    }
  }
  if (dataUrls.length) {
    const { ok } = await uploadSnaps(dataUrls)
    if (ok) {
      celebrate()
      showToast(`사진 ${ok}장을 올렸어요 💕`)
    }
  }
  if (errors.length) alert(`일부 사진을 올리지 못했어요(형식 확인): ${errors.join(', ')}`)
  busy.value = false
}
function onSelect(e) {
  handleFiles(e.target.files)
  e.target.value = ''
}
function onDrop(e) {
  dragging.value = false
  handleFiles(e.dataTransfer?.files)
}

// 라이트박스
const lightboxOpen = ref(false)
const activeIndex = ref(0)
function open(i) {
  activeIndex.value = i
  lightboxOpen.value = true
}
function close() {
  lightboxOpen.value = false
}

async function onDelete(item) {
  if (!confirm('이 사진을 삭제할까요?')) return
  await removeMine(item.id)
}
</script>

<template>
  <section class="section">
    <SectionTitle label="Guest Snap" title="하객 스냅" />

    <p class="mb-5 text-center text-sm leading-6 text-ink/65">
      오늘의 순간을 함께 남겨주세요.<br />
      올려주신 사진은 모두에게 공개됩니다 🤍
    </p>

    <!-- 업로드(파일 선택 + 웹 드래그&드롭) -->
    <div class="glass-card space-y-3 p-5">
      <label
        class="flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border-2 border-dashed px-6 py-9 text-center transition"
        :class="dragging ? 'border-aurora-lilac bg-aurora-lilac/10' : 'border-aurora-lilac/40'"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="onDrop"
      >
        <Camera class="h-8 w-8 text-aurora-lilac" :stroke-width="1.5" />
        <span class="text-base font-medium text-ink/75">사진 올리기</span>
        <input type="file" accept="image/*" multiple class="hidden" @change="onSelect" />
      </label>
      <p v-if="busy" class="flex items-center justify-center gap-2 text-sm text-ink/60">
        <LoaderCircle class="h-4 w-4 animate-spin" /> 올리는 중...
      </p>
      <transition name="snap-toast">
        <p
          v-if="toast"
          class="rounded-xl bg-aurora-mint/20 py-2 text-center text-sm font-medium text-rosewood-500"
        >
          {{ toast }}
        </p>
      </transition>
    </div>

    <!-- 사진 그리드 -->
    <div v-if="items.length" class="mt-5 grid grid-cols-3 gap-2" v-auto-animate>
      <div
        v-for="(snap, i) in items"
        :key="snap.id"
        class="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-white/60"
      >
        <img
          :src="snap.dataUrl"
          :alt="snap.name ? `${snap.name}의 스냅` : '하객 스냅'"
          loading="lazy"
          class="h-full w-full cursor-pointer object-cover"
          @click="open(i)"
        />
        <span
          v-if="snap.name"
          class="pointer-events-none absolute bottom-0 left-0 right-0 truncate bg-black/40 px-1.5 py-0.5 text-[10px] text-white"
        >
          {{ snap.name }}
        </span>
        <button
          v-if="isMine(snap.id)"
          class="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
          aria-label="내 스냅 삭제"
          @click="onDelete(snap)"
        >
          <Trash2 class="h-3 w-3" />
        </button>
      </div>
    </div>

    <div
      v-else
      class="glass-card mt-5 flex flex-col items-center gap-2 px-6 py-10 text-center"
    >
      <Images class="h-9 w-9 text-aurora-lilac/70" :stroke-width="1.5" />
      <p class="text-sm text-ink/60">아직 올라온 스냅이 없어요.</p>
      <p class="text-xs text-ink/40">첫 사진을 남겨주세요 📸</p>
    </div>

    <!-- 라이트박스 -->
    <Teleport to="body">
      <transition name="snap-fade">
        <div v-if="lightboxOpen && items.length" class="fixed inset-0 z-[60] bg-black/90">
          <button
            class="absolute right-4 top-4 z-20 rounded-full bg-white/15 p-2 text-white backdrop-blur"
            aria-label="닫기"
            @click="close"
          >
            <X class="h-5 w-5" />
          </button>

          <Swiper
            :modules="lightboxModules"
            :initial-slide="activeIndex"
            :loop="items.length > 1"
            :navigation="{ nextEl: '.gs-next', prevEl: '.gs-prev' }"
            :pagination="{ type: 'fraction' }"
            class="h-full w-full"
          >
            <SwiperSlide v-for="(snap, i) in items" :key="`gs-${snap.id}`">
              <div class="flex h-full w-full items-center justify-center p-4">
                <img
                  :src="snap.dataUrl"
                  :alt="`하객 스냅 ${i + 1}`"
                  class="max-h-[88vh] max-w-[94vw] rounded-lg object-contain"
                />
              </div>
            </SwiperSlide>
          </Swiper>

          <button
            v-if="items.length > 1"
            class="gs-prev absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur"
            aria-label="이전"
          >
            <ChevronLeft class="h-6 w-6" />
          </button>
          <button
            v-if="items.length > 1"
            class="gs-next absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur"
            aria-label="다음"
          >
            <ChevronRight class="h-6 w-6" />
          </button>
        </div>
      </transition>
    </Teleport>
  </section>
</template>

<style scoped>
.snap-fade-enter-active,
.snap-fade-leave-active {
  transition: opacity 0.3s ease;
}
.snap-fade-enter-from,
.snap-fade-leave-to {
  opacity: 0;
}
.snap-toast-enter-active,
.snap-toast-leave-active {
  transition: opacity 0.3s ease;
}
.snap-toast-enter-from,
.snap-toast-leave-to {
  opacity: 0;
}
:deep(.swiper-pagination-fraction) {
  color: #ffffff;
}
</style>
