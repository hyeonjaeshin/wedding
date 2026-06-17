<script setup>
import { ref, onMounted } from 'vue'
import { MapPin, Copy, Navigation, TrainFront, Bus, Phone, MessageSquare } from '@lucide/vue'
import SectionTitle from '../ui/SectionTitle.vue'
import { wedding, directions, notice, couple } from '../../data/invitation'

// 오시는 길: 실제 지도(키 없이 동작하는 임베드) + 주소/연락처 + 길찾기
const { address, name, lat, lng } = wedding.venue
const query = encodeURIComponent(address)

// 키 없이 바로 보이는 구글 지도 임베드(모든 기기에서 동작)
const embedUrl = `https://maps.google.com/maps?q=${query}&z=16&hl=ko&output=embed`

// 외부 지도 앱 길찾기 (주소 검색 기반 — 좌표 없이 정확)
const naverUrl = `https://map.naver.com/v5/search/${query}`
const kakaoUrl = `https://map.kakao.com/?q=${query}`
const googleUrl = `https://www.google.com/maps/search/?api=1&query=${query}`

// (선택) 카카오 지도 SDK: VITE_KAKAO_MAP_KEY + 좌표(lat/lng)가 있으면 인터랙티브 카카오맵을 렌더.
// 키가 없으면 위 구글 임베드가 그대로 표시된다.
const kakaoKey = import.meta.env.VITE_KAKAO_MAP_KEY
const useKakao = ref(false)

onMounted(() => {
  if (!kakaoKey || lat == null || lng == null) return
  const src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false`
  const script = document.createElement('script')
  script.src = src
  script.onload = () => {
    // eslint-disable-next-line no-undef
    kakao.maps.load(() => {
      useKakao.value = true
      const container = document.getElementById('kakao-map')
      const center = new kakao.maps.LatLng(lat, lng)
      const map = new kakao.maps.Map(container, { center, level: 4 })
      new kakao.maps.Marker({ position: center, map })
    })
  }
  script.onerror = () => (useKakao.value = false)
  document.head.appendChild(script)
})

async function copyAddress() {
  try {
    await navigator.clipboard.writeText(address)
    alert('주소가 복사되었습니다.')
  } catch {
    alert('복사에 실패했습니다. 직접 복사해 주세요.')
  }
}
</script>

<template>
  <section class="section">
    <SectionTitle label="Location" title="오시는 길" />

    <div class="text-center">
      <p class="font-serif text-lg text-ink">{{ name }}</p>
      <p v-if="wedding.venue.hall" class="mt-1 text-sm text-ink/70">{{ wedding.venue.hall }}</p>
    </div>

    <!-- 지도: 카카오(키 있을 때) 또는 구글 임베드(기본) -->
    <div class="mt-6 overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/60">
      <div v-show="useKakao" id="kakao-map" class="h-60 w-full" />
      <iframe
        v-if="!useKakao"
        :src="embedUrl"
        class="h-60 w-full border-0"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="예식장 위치 지도"
      />
    </div>

    <div class="mt-5 space-y-1 text-center text-sm text-ink/80">
      <p class="inline-flex items-center gap-1">
        <MapPin class="h-4 w-4 text-rosewood-400" /> {{ address }}
      </p>
      <p v-if="wedding.venue.addressDetail">{{ wedding.venue.addressDetail }}</p>
      <p class="text-ink/60">Tel. {{ wedding.venue.tel }}</p>
    </div>

    <!-- 대중교통 안내 -->
    <div class="glass-card mt-5 space-y-3 p-5 text-sm leading-6 text-ink/80">
      <div v-if="directions.subway" class="flex gap-2.5">
        <TrainFront class="mt-0.5 h-4 w-4 shrink-0 text-aurora-blue" />
        <div>
          <p class="font-semibold text-ink/90">지하철</p>
          <p class="mt-0.5">{{ directions.subway }}</p>
        </div>
      </div>
      <div v-if="directions.bus" class="flex gap-2.5">
        <Bus class="mt-0.5 h-4 w-4 shrink-0 text-aurora-mint" />
        <div>
          <p class="font-semibold text-ink/90">버스</p>
          <p class="mt-0.5">{{ directions.bus }}</p>
        </div>
      </div>
    </div>

    <div class="mt-5 grid grid-cols-2 gap-2">
      <button class="aurora-btn-outline" @click="copyAddress">
        <Copy class="h-4 w-4" /> 주소 복사
      </button>
      <a :href="naverUrl" target="_blank" rel="noopener" class="aurora-btn-outline">
        <Navigation class="h-4 w-4" /> 네이버 지도
      </a>
      <a :href="kakaoUrl" target="_blank" rel="noopener" class="aurora-btn-outline">
        <Navigation class="h-4 w-4" /> 카카오 지도
      </a>
      <a :href="googleUrl" target="_blank" rel="noopener" class="aurora-btn-outline">
        <Navigation class="h-4 w-4" /> 구글 지도
      </a>
    </div>

    <!-- 신랑·신부 연락처 (번호 있을 때만 표시) -->
    <div v-if="couple.groom.phone || couple.bride.phone" class="mt-5 space-y-2">
      <div
        v-for="person in [couple.groom, couple.bride]"
        :key="person.role"
        v-show="person.phone"
        class="glass-card flex items-center justify-between gap-3 px-4 py-3"
      >
        <span class="text-sm text-ink/80">
          <span class="text-ink/50">{{ person.role }}</span>
          <span class="ml-2 font-serif text-base text-ink">{{ person.shortName }}</span>
        </span>
        <div class="flex gap-2">
          <a
            :href="`tel:${person.phone}`"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-aurora-pink to-aurora-lilac text-white shadow-sm"
            :aria-label="`${person.shortName} 전화하기`"
          >
            <Phone class="h-4 w-4" />
          </a>
          <a
            :href="`sms:${person.phone}`"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-aurora-blue to-aurora-mint text-white shadow-sm"
            :aria-label="`${person.shortName} 문자보내기`"
          >
            <MessageSquare class="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>

    <!-- 화환 사양 안내 -->
    <p
      v-if="notice.noFlowers"
      class="mt-6 whitespace-pre-line text-center text-xs leading-5 text-ink/55"
    >
      {{ notice.noFlowers }}
    </p>
  </section>
</template>
