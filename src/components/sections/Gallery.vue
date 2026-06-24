<script setup>
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectFade, Autoplay, Pagination, Navigation } from 'swiper/modules'
import { X, ChevronLeft, ChevronRight } from '@lucide/vue'
import SectionTitle from '../ui/SectionTitle.vue'
import { useGallery } from '../../composables/useGallery'

// 갤러리 이미지 = 정적 번들 사진 + 업로드 사진(Firestore)
const { images } = useGallery()

// Swiper 스타일
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

// 메인 캐러셀 모듈
const mainModules = [EffectFade, Autoplay, Pagination]
const lightboxModules = [Navigation, Pagination]

// 라이트박스(전체화면 슬라이더) 상태
const lightboxOpen = ref(false)
const activeIndex = ref(0)

function open(i) {
  activeIndex.value = i
  lightboxOpen.value = true
}
function close() {
  lightboxOpen.value = false
}
</script>

<template>
  <section class="section">
    <SectionTitle label="Gallery" title="우리의 순간들" />

    <!-- 메인 페이드 캐러셀 -->
    <div class="overflow-hidden rounded-2xl shadow-lg">
      <Swiper
        :modules="mainModules"
        effect="fade"
        :fade-effect="{ crossFade: true }"
        :loop="images.length > 2"
        :autoplay="{ delay: 3500, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        class="aspect-[4/5] w-full"
      >
        <SwiperSlide v-for="(img, i) in images" :key="img">
          <img
            :src="img"
            :alt="`갤러리 사진 ${i + 1}`"
            :loading="i === 0 ? 'eager' : 'lazy'"
            decoding="async"
            class="h-full w-full cursor-pointer object-cover"
            @click="open(i)"
          />
        </SwiperSlide>
      </Swiper>
    </div>

    <!-- 썸네일 그리드 -->
    <div class="mt-3 grid grid-cols-4 gap-2">
      <button
        v-for="(img, i) in images"
        :key="`thumb-${img}`"
        type="button"
        class="aspect-square overflow-hidden rounded-lg ring-1 ring-white/60"
        @click="open(i)"
      >
        <img
          :src="img"
          :alt="`썸네일 ${i + 1}`"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </button>
    </div>

    <!-- 라이트박스 (Teleport: 부모 섹션의 v-motion transform 영향에서 분리 → 전체화면 보장) -->
    <Teleport to="body">
    <transition name="fade">
      <div v-if="lightboxOpen" class="fixed inset-0 z-[60] bg-black/90">
        <button
          class="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-2 text-white backdrop-blur"
          aria-label="닫기"
          @click="close"
        >
          <X class="h-5 w-5" />
        </button>

        <Swiper
          :modules="lightboxModules"
          :initial-slide="activeIndex"
          :loop="images.length > 2"
          :navigation="{ nextEl: '.lb-next', prevEl: '.lb-prev' }"
          :pagination="{ type: 'fraction' }"
          class="h-full w-full"
        >
          <SwiperSlide v-for="(img, i) in images" :key="`lb-${img}`">
            <div class="flex h-full w-full items-center justify-center p-4">
              <img
                :src="img"
                :alt="`갤러리 사진 ${i + 1}`"
                class="max-h-[88vh] max-w-[94vw] rounded-lg object-contain"
              />
            </div>
          </SwiperSlide>
        </Swiper>

        <button class="lb-prev absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur" aria-label="이전">
          <ChevronLeft class="h-6 w-6" />
        </button>
        <button class="lb-next absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur" aria-label="다음">
          <ChevronRight class="h-6 w-6" />
        </button>
      </div>
    </transition>
    </Teleport>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Swiper 페이지네이션 점을 오로라 톤으로 */
:deep(.swiper-pagination-bullet) {
  background: #ffffff;
  opacity: 0.6;
}
:deep(.swiper-pagination-bullet-active) {
  background: linear-gradient(120deg, #eaa0b3, #c4a9f0, #8fc7f0);
  opacity: 1;
}
:deep(.swiper-pagination-fraction) {
  color: #ffffff;
}
</style>
