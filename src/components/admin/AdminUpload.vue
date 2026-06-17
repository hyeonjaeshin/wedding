<script setup>
import { ref, computed, onMounted } from 'vue'
import { Lock, ImagePlus, Trash2, CloudUpload, ArrowLeft, LoaderCircle, ArrowUp, ArrowDown, Info } from '@lucide/vue'
import { useGallery } from '../../composables/useGallery'
import { useImageCompress } from '../../composables/useImageCompress'

// ── 패스코드 게이트 (비밀 URL + 패스코드 수준의 가벼운 보호) ──
// .env 의 VITE_ADMIN_PASSCODE 로 설정. 미설정 시 기본값 사용.
const PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'wedding1017'
const unlocked = ref(false)
const passInput = ref('')
const passError = ref(false)
const SESSION_KEY = 'wedding-admin-unlocked'

onMounted(() => {
  if (sessionStorage.getItem(SESSION_KEY) === '1') unlocked.value = true
})

function tryUnlock() {
  if (passInput.value === PASSCODE) {
    unlocked.value = true
    sessionStorage.setItem(SESSION_KEY, '1')
    passError.value = false
  } else {
    passError.value = true
  }
}

// ── 업로드 ──
const { uploaded, submitting, uploadDataUrls, removePhoto, movePhoto } = useGallery()

async function onDelete(id) {
  if (confirm('이 사진을 삭제할까요? (되돌릴 수 없습니다)')) await removePhoto(id)
}
const { compress } = useImageCompress()

const pending = ref([]) // { dataUrl, bytes, name }
const compressing = ref(false)
const progress = ref(0)

const fmtKB = (b) => (b / 1024).toFixed(0) + 'KB'
const pendingTotal = computed(() => pending.value.reduce((s, p) => s + p.bytes, 0))

async function onSelect(e) {
  const files = [...(e.target.files || [])]
  if (!files.length) return
  compressing.value = true
  try {
    for (const file of files) {
      try {
        const { dataUrl, bytes } = await compress(file)
        pending.value.push({ dataUrl, bytes, name: file.name })
      } catch {
        /* 개별 파일 실패는 건너뜀 */
      }
    }
  } finally {
    compressing.value = false
    e.target.value = '' // 같은 파일 다시 선택 가능하도록 초기화
  }
}

function removePending(i) {
  pending.value.splice(i, 1)
}

async function doUpload() {
  if (!pending.value.length) return
  progress.value = 0
  const { ok, fail } = await uploadDataUrls(
    pending.value.map((p) => p.dataUrl),
    (done) => (progress.value = done)
  )
  pending.value = []
  alert(`업로드 완료: 성공 ${ok}건${fail ? `, 실패 ${fail}건` : ''}`)
}

function goHome() {
  window.location.hash = ''
}
</script>

<template>
  <div class="aurora-bg min-h-screen">
    <div class="invitation-shell px-6 py-10">
      <!-- 패스코드 게이트 -->
      <div v-if="!unlocked" class="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div class="glass-card w-full max-w-xs p-7">
          <Lock class="mx-auto mb-3 h-8 w-8 text-aurora-lilac" :stroke-width="1.5" />
          <h1 class="aurora-text font-serif text-xl font-bold">사진 관리</h1>
          <p class="mt-2 text-xs text-ink/55">관리자 패스코드를 입력하세요</p>
          <input
            v-model="passInput"
            type="password"
            placeholder="패스코드"
            class="mt-5 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-center text-sm outline-none focus:border-aurora-lilac"
            @keyup.enter="tryUnlock"
          />
          <p v-if="passError" class="mt-2 text-xs text-rosewood-500">패스코드가 올바르지 않습니다.</p>
          <button class="aurora-btn mt-4 w-full" @click="tryUnlock">들어가기</button>
          <button class="mt-3 text-xs text-ink/40" @click="goHome">← 청첩장으로 돌아가기</button>
        </div>
      </div>

      <!-- 업로드 화면 -->
      <div v-else>
        <div class="mb-6 flex items-center justify-between">
          <h1 class="aurora-text font-serif text-2xl font-bold">갤러리 사진 관리</h1>
          <button class="aurora-btn-outline !px-3 !py-2" @click="goHome">
            <ArrowLeft class="h-4 w-4" /> 청첩장
          </button>
        </div>

        <!-- 파일 선택 -->
        <label
          class="glass-card flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed border-aurora-lilac/40 px-6 py-10 text-center"
        >
          <ImagePlus class="h-8 w-8 text-aurora-lilac" :stroke-width="1.5" />
          <span class="text-sm font-medium text-ink/70">사진 선택 (여러 장 가능)</span>
          <span class="text-xs text-ink/45">선택하면 자동으로 웹용 압축됩니다</span>
          <input type="file" accept="image/*" multiple class="hidden" @change="onSelect" />
        </label>

        <p v-if="compressing" class="mt-3 flex items-center justify-center gap-2 text-sm text-ink/60">
          <LoaderCircle class="h-4 w-4 animate-spin" /> 압축 중...
        </p>

        <!-- 선택한 사진 미리보기 -->
        <div v-if="pending.length" class="mt-5">
          <p class="mb-2 text-xs text-ink/55">
            선택 {{ pending.length }}장 · 합계 {{ fmtKB(pendingTotal) }}
          </p>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="(p, i) in pending" :key="i" class="relative aspect-square overflow-hidden rounded-lg">
              <img :src="p.dataUrl" class="h-full w-full object-cover" />
              <span class="absolute bottom-0 left-0 right-0 bg-black/45 py-0.5 text-center text-[10px] text-white">
                {{ fmtKB(p.bytes) }}
              </span>
              <button
                class="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                @click="removePending(i)"
              >
                <Trash2 class="h-3 w-3" />
              </button>
            </div>
          </div>
          <button class="aurora-btn mt-4 w-full" :disabled="submitting" @click="doUpload">
            <CloudUpload class="h-4 w-4" />
            {{ submitting ? `업로드 중... (${progress}/${pending.length})` : `${pending.length}장 업로드` }}
          </button>
        </div>

        <!-- 업로드된 사진 목록 (순서 변경 · 삭제) -->
        <div class="mt-10">
          <h2 class="mb-1 text-sm font-semibold text-ink/70">
            업로드된 사진 <span class="text-ink/40">({{ uploaded.length }})</span>
          </h2>
          <p class="mb-3 text-[11px] text-ink/45">↑ ↓ 로 순서 변경, 휴지통으로 삭제합니다.</p>
          <p v-if="!uploaded.length" class="text-xs text-ink/45">아직 업로드한 사진이 없습니다.</p>
          <ul v-else class="space-y-2">
            <li
              v-for="(item, i) in uploaded"
              :key="item.id"
              class="glass-card flex items-center gap-3 p-2"
            >
              <span class="w-5 shrink-0 text-center text-xs text-ink/40">{{ i + 1 }}</span>
              <img :src="item.dataUrl" class="h-14 w-14 shrink-0 rounded-lg object-cover" />
              <div class="ml-auto flex items-center gap-1">
                <button
                  class="rounded-lg border border-white/70 bg-white/60 p-2 text-ink/60 disabled:opacity-30"
                  :disabled="i === 0"
                  aria-label="위로"
                  @click="movePhoto(item.id, -1)"
                >
                  <ArrowUp class="h-4 w-4" />
                </button>
                <button
                  class="rounded-lg border border-white/70 bg-white/60 p-2 text-ink/60 disabled:opacity-30"
                  :disabled="i === uploaded.length - 1"
                  aria-label="아래로"
                  @click="movePhoto(item.id, 1)"
                >
                  <ArrowDown class="h-4 w-4" />
                </button>
                <button
                  class="rounded-lg border border-rosewood-300/60 bg-white/60 p-2 text-rosewood-500"
                  aria-label="삭제"
                  @click="onDelete(item.id)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </li>
          </ul>
        </div>

        <!-- 사용 가이드 -->
        <div class="mt-8 rounded-2xl border border-white/60 bg-white/45 p-4 text-[12px] leading-6 text-ink/60 backdrop-blur">
          <p class="mb-1 flex items-center gap-1.5 font-semibold text-ink/70">
            <Info class="h-4 w-4 text-aurora-lilac" /> 사용 방법
          </p>
          <ol class="list-decimal space-y-0.5 pl-4">
            <li>위 "사진 선택"으로 사진을 고르면 자동으로 웹용 압축됩니다.</li>
            <li>"업로드" 버튼을 누르면 갤러리(맨 뒤)에 추가됩니다.</li>
            <li>목록에서 ↑↓ 로 순서를 바꾸고, 🗑 로 삭제할 수 있습니다.</li>
            <li>변경은 청첩장 갤러리에 실시간 반영됩니다.</li>
          </ol>
          <p class="mt-2 text-[11px] text-ink/40">
            이 페이지는 비밀 주소(<b>#/admin</b>) + 패스코드로만 접근할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
