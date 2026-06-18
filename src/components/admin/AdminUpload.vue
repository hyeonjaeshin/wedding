<script setup>
import { ref, computed, onMounted } from 'vue'
import { Lock, ImagePlus, Trash2, CloudUpload, ArrowLeft, LoaderCircle, ArrowUp, ArrowDown, Info } from '@lucide/vue'
import { useGallery } from '../../composables/useGallery'
import { useCovers } from '../../composables/useCovers'
import { useGuestsnap } from '../../composables/useGuestsnap'
import { useImageCompress } from '../../composables/useImageCompress'

// ── 패스코드 게이트 (비밀 URL + 패스코드 수준의 가벼운 보호) ──
const PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'wedding1031'
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

// ── 컬렉션들 ──
const gallery = useGallery()
const covers = useCovers()
const guestsnap = useGuestsnap()
const { compressToBlob } = useImageCompress()

// 커버는 전체화면이라 더 큰 해상도/높은 품질로 저장(Storage 라 용량 제약 없음)
const compressOpts = computed(() =>
  tab.value === 'covers' ? { maxDim: 2200, quality: 0.85 } : { maxDim: 1600, quality: 0.82 }
)

// 탭: 갤러리 / 커버 / 게스트스냅
const tab = ref('gallery')
const TABS = [
  { key: 'gallery', label: '갤러리' },
  { key: 'covers', label: '커버' },
  { key: 'guestsnap', label: '게스트스냅' },
]
// 업로드 대상(갤러리/커버 공용 UI)
const target = computed(() => (tab.value === 'covers' ? covers : gallery))
function switchTab(k) {
  if (k === tab.value) return
  pending.value = []
  tab.value = k
}

// ── 업로드(갤러리/커버) ──
const pending = ref([]) // { blob, previewUrl, bytes, name }
const compressing = ref(false)
const dragging = ref(false)
const progress = ref(0)

const fmtKB = (b) => (b / 1024).toFixed(0) + 'KB'
const pendingTotal = computed(() => pending.value.reduce((s, p) => s + p.bytes, 0))

// 파일 → 압축 → pending. 실패는 모아서 안내(조용히 무시하지 않음 = 모바일 버그 수정 핵심).
async function handleFiles(fileList) {
  const files = Array.from(fileList || []).filter(
    (f) => (f.type || '').startsWith('image/') || /\.(heic|heif)$/i.test(f.name)
  )
  if (!files.length) return
  compressing.value = true
  const errors = []
  try {
    for (const file of files) {
      try {
        const { blob, bytes } = await compressToBlob(file, compressOpts.value)
        pending.value.push({ blob, previewUrl: URL.createObjectURL(blob), bytes, name: file.name })
      } catch (err) {
        errors.push(`${file.name}: ${err?.message || '처리 실패'}`)
      }
    }
  } finally {
    compressing.value = false
  }
  if (errors.length) alert('일부 사진을 처리하지 못했어요:\n' + errors.join('\n'))
}
function onSelect(e) {
  handleFiles(e.target.files)
  e.target.value = '' // 같은 파일 다시 선택 가능
}
function onDrop(e) {
  dragging.value = false
  handleFiles(e.dataTransfer?.files)
}

function removePending(i) {
  URL.revokeObjectURL(pending.value[i]?.previewUrl)
  pending.value.splice(i, 1)
}

async function doUpload() {
  if (!pending.value.length) return
  progress.value = 0
  const { ok, fail } = await target.value.uploadBlobs(
    pending.value.map((p) => p.blob),
    (done) => (progress.value = done)
  )
  pending.value.forEach((p) => URL.revokeObjectURL(p.previewUrl))
  pending.value = []
  alert(`업로드 완료: 성공 ${ok}건${fail ? `, 실패 ${fail}건` : ''}`)
}

async function onDelete(id) {
  if (confirm('이 사진을 삭제할까요? (되돌릴 수 없습니다)')) await target.value.removePhoto(id)
}
async function onDeleteSnap(id) {
  if (confirm('이 게스트스냅을 삭제할까요?')) await guestsnap.removePhoto(id)
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

      <!-- 관리 화면 -->
      <div v-else>
        <div class="mb-5 flex items-center justify-between">
          <h1 class="aurora-text font-serif text-2xl font-bold">사진 관리</h1>
          <button class="aurora-btn-outline !px-3 !py-2" @click="goHome">
            <ArrowLeft class="h-4 w-4" /> 청첩장
          </button>
        </div>

        <!-- 탭 -->
        <div class="mb-6 grid grid-cols-3 gap-1 rounded-xl bg-white/50 p-1">
          <button
            v-for="t in TABS"
            :key="t.key"
            class="rounded-lg py-2 text-sm font-medium transition"
            :class="tab === t.key ? 'aurora-btn !py-2' : 'text-ink/60'"
            @click="switchTab(t.key)"
          >
            {{ t.label }}
          </button>
        </div>

        <!-- 갤러리 / 커버: 업로드 + 목록 -->
        <template v-if="tab === 'gallery' || tab === 'covers'">
          <label
            class="glass-card flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed px-6 py-10 text-center transition"
            :class="dragging ? 'border-aurora-lilac bg-aurora-lilac/10' : 'border-aurora-lilac/40'"
            @dragover.prevent="dragging = true"
            @dragleave.prevent="dragging = false"
            @drop.prevent="onDrop"
          >
            <ImagePlus class="h-8 w-8 text-aurora-lilac" :stroke-width="1.5" />
            <span class="text-sm font-medium text-ink/70">
              {{ tab === 'covers' ? '커버 사진' : '갤러리 사진' }} 선택 (여러 장 가능)
            </span>
            <span class="text-xs text-ink/45">선택하거나 끌어다 놓으면 자동 압축됩니다</span>
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
                <img :src="p.previewUrl" class="h-full w-full object-cover" />
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
            <button class="aurora-btn mt-4 w-full" :disabled="target.submitting.value" @click="doUpload">
              <CloudUpload class="h-4 w-4" />
              {{ target.submitting.value ? `업로드 중... (${progress}/${pending.length})` : `${pending.length}장 업로드` }}
            </button>
          </div>

          <!-- 업로드된 사진 목록 (순서 변경 · 삭제) -->
          <div class="mt-10">
            <h2 class="mb-1 text-sm font-semibold text-ink/70">
              업로드된 {{ tab === 'covers' ? '커버' : '갤러리' }}
              <span class="text-ink/40">({{ target.uploaded.value.length }})</span>
            </h2>
            <p class="mb-3 text-[11px] text-ink/45">↑ ↓ 로 순서 변경, 휴지통으로 삭제합니다.</p>
            <p v-if="!target.uploaded.value.length" class="text-xs text-ink/45">아직 업로드한 사진이 없습니다.</p>
            <ul v-else class="space-y-2">
              <li
                v-for="(item, i) in target.uploaded.value"
                :key="item.id"
                class="glass-card flex items-center gap-3 p-2"
              >
                <span class="w-5 shrink-0 text-center text-xs text-ink/40">{{ i + 1 }}</span>
                <img :src="item.src" class="h-14 w-14 shrink-0 rounded-lg object-cover" />
                <div class="ml-auto flex items-center gap-1">
                  <button
                    class="rounded-lg border border-white/70 bg-white/60 p-2 text-ink/60 disabled:opacity-30"
                    :disabled="i === 0"
                    aria-label="위로"
                    @click="target.movePhoto(item.id, -1)"
                  >
                    <ArrowUp class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded-lg border border-white/70 bg-white/60 p-2 text-ink/60 disabled:opacity-30"
                    :disabled="i === target.uploaded.value.length - 1"
                    aria-label="아래로"
                    @click="target.movePhoto(item.id, 1)"
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
        </template>

        <!-- 게스트스냅: 하객 업로드 사진 관리(삭제) -->
        <template v-else>
          <p class="mb-3 text-[12px] leading-6 text-ink/60">
            하객이 올린 사진입니다. 부적절한 사진은 휴지통으로 삭제하세요.
            <br />(업로드는 청첩장의 “하객 스냅” 섹션에서 하객이 직접 합니다.)
          </p>
          <p v-if="!guestsnap.items.value.length" class="text-xs text-ink/45">아직 올라온 스냅이 없습니다.</p>
          <div v-else class="grid grid-cols-3 gap-2">
            <div
              v-for="snap in guestsnap.items.value"
              :key="snap.id"
              class="relative aspect-square overflow-hidden rounded-lg ring-1 ring-white/60"
            >
              <img :src="snap.src" class="h-full w-full object-cover" />
              <span
                v-if="snap.name"
                class="pointer-events-none absolute bottom-0 left-0 right-0 truncate bg-black/40 px-1 py-0.5 text-[10px] text-white"
              >
                {{ snap.name }}
              </span>
              <button
                class="absolute right-1 top-1 rounded-full bg-black/55 p-1 text-white"
                aria-label="삭제"
                @click="onDeleteSnap(snap.id)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </template>

        <!-- 사용 가이드 -->
        <div class="mt-8 rounded-2xl border border-white/60 bg-white/45 p-4 text-[12px] leading-6 text-ink/60 backdrop-blur">
          <p class="mb-1 flex items-center gap-1.5 font-semibold text-ink/70">
            <Info class="h-4 w-4 text-aurora-lilac" /> 사용 방법
          </p>
          <ol class="list-decimal space-y-0.5 pl-4">
            <li><b>갤러리/커버</b> 탭에서 사진을 고르거나 끌어다 놓으면 자동 압축됩니다.</li>
            <li>"업로드" 버튼을 누르면 해당 위치(맨 뒤)에 추가됩니다.</li>
            <li>목록에서 ↑↓ 로 순서를 바꾸고, 🗑 로 삭제할 수 있습니다.</li>
            <li><b>게스트스냅</b> 탭에서는 하객이 올린 사진을 정리(삭제)할 수 있습니다.</li>
            <li>변경은 청첩장에 실시간 반영됩니다.</li>
          </ol>
          <p class="mt-2 text-[11px] text-ink/40">
            이 페이지는 비밀 주소(<b>#/admin</b>) + 패스코드로만 접근할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
