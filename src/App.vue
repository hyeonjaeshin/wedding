<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ChevronUp } from '@lucide/vue'
import BgmPlayer from './components/BgmPlayer.vue'
import AdminUpload from './components/admin/AdminUpload.vue'
import MainCover from './components/sections/MainCover.vue'
import Invitation from './components/sections/Invitation.vue'
import Together from './components/sections/Together.vue'
import Countdown from './components/sections/Countdown.vue'
import Gallery from './components/sections/Gallery.vue'
import GuestSnap from './components/sections/GuestSnap.vue'
import Location from './components/sections/Location.vue'
import Rsvp from './components/sections/Rsvp.vue'
import Guestbook from './components/sections/Guestbook.vue'
import Account from './components/sections/Account.vue'
import Footer from './components/sections/Footer.vue'

// 경량 해시 라우팅: #/admin 이면 사진 업로드 화면, 그 외엔 청첩장
const hash = ref(window.location.hash)
const isAdmin = computed(() => hash.value.replace(/^#/, '').replace(/^\//, '') === 'admin')
function onHashChange() {
  hash.value = window.location.hash
}

// 섹션 공통 진입 모션 프리셋 (@vueuse/motion 의 v-motion)
const rise = {
  initial: { opacity: 0, y: 40 },
  visibleOnce: { opacity: 1, y: 0, transition: { duration: 700, ease: 'easeOut' } },
}

// 상단 스크롤 진행바 (0~100%)
const progress = ref(0)
// 위로가기 버튼: 어느 정도 내려갔을 때만 표시
const showTop = computed(() => progress.value > 12)
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function onScroll() {
  const h = document.documentElement
  const max = h.scrollHeight - h.clientHeight
  progress.value = max > 0 ? (h.scrollTop / max) * 100 : 0
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('hashchange', onHashChange)
  onScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('hashchange', onHashChange)
})
</script>

<template>
  <!-- #/admin: 사진 업로드(관리) 화면 -->
  <AdminUpload v-if="isAdmin" />

  <!-- 모바일 청첩장: 화면 중앙 단일 컬럼 + 움직이는 오로라 배경 -->
  <div v-else class="aurora-bg min-h-screen">
    <!-- 상단 오로라 스크롤 진행바 -->
    <div class="fixed left-0 top-0 z-50 h-1 w-full bg-transparent">
      <div class="scroll-progress h-full" :style="{ width: progress + '%' }" />
    </div>

    <BgmPlayer />
    <main class="invitation-shell">
      <MainCover />
      <Invitation id="after-cover" v-motion :initial="rise.initial" :visible-once="rise.visibleOnce" />
      <Together v-motion :initial="rise.initial" :visible-once="rise.visibleOnce" />
      <Countdown v-motion :initial="rise.initial" :visible-once="rise.visibleOnce" />
      <Gallery v-motion :initial="rise.initial" :visible-once="rise.visibleOnce" />
      <GuestSnap v-motion :initial="rise.initial" :visible-once="rise.visibleOnce" />
      <Location v-motion :initial="rise.initial" :visible-once="rise.visibleOnce" />
      <Guestbook v-motion :initial="rise.initial" :visible-once="rise.visibleOnce" />
      <Account v-motion :initial="rise.initial" :visible-once="rise.visibleOnce" />
      <Rsvp v-motion :initial="rise.initial" :visible-once="rise.visibleOnce" />
      <Footer v-motion :initial="rise.initial" :visible-once="rise.visibleOnce" />
    </main>

    <!-- 위로가기 버튼 (스크롤 내려가면 등장) -->
    <transition name="totop">
      <button
        v-if="showTop"
        type="button"
        class="to-top aurora-btn !p-0"
        aria-label="맨 위로"
        @click="scrollToTop"
      >
        <ChevronUp class="h-5 w-5" />
      </button>
    </transition>
  </div>
</template>

<style scoped>
.scroll-progress {
  background: linear-gradient(90deg, #f7a8c8, #c4a9f0, #8fc7f0, #8ad9c0);
  background-size: 200% auto;
  animation: auroraHue 6s linear infinite;
  box-shadow: 0 0 10px rgba(196, 169, 240, 0.7);
  transition: width 0.1s linear;
}

/* 위로가기 플로팅 버튼 */
.to-top {
  position: fixed;
  right: 1rem;
  bottom: calc(1rem + env(safe-area-inset-bottom));
  z-index: 50;
  height: 2.75rem;
  width: 2.75rem;
}
.totop-enter-active,
.totop-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.totop-enter-from,
.totop-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
