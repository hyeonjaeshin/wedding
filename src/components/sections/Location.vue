<script setup>
import { MapPin, Copy, Navigation, TrainFront, Bus, Car, Phone, MessageSquare } from '@lucide/vue'
import SectionTitle from '../ui/SectionTitle.vue'
import { wedding, directions, notice, couple } from '../../data/invitation'

// 오시는 길: 약도 이미지(탭하면 지도앱) + 주소/교통/연락처
const { address, name } = wedding.venue
// 지도/길찾기는 "장소명"으로 검색해 예식장이 바로 잡히게 한다(없으면 주소).
const placeQuery = encodeURIComponent(wedding.venue.searchKeyword || address)

// 외부 지도 앱 길찾기 (장소명 검색 기반)
const naverUrl = `https://map.naver.com/v5/search/${placeQuery}`
const kakaoUrl = `https://map.kakao.com/?q=${placeQuery}`
// 티맵은 주소 검색 웹URL이 없어 앱 스킴으로 연결(티맵 앱 설치된 폰에서 동작)
const tmapUrl = `tmap://search?name=${placeQuery}`

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
      <p v-if="wedding.venue.brideRoom" class="mt-0.5 text-xs text-ink/50">{{ wedding.venue.brideRoom }}</p>
    </div>

    <!-- 오시는 길 약도(지도 대신) — 탭하면 지도 앱에서 열림 -->
    <a
      v-if="directions.image"
      :href="naverUrl"
      target="_blank"
      rel="noopener"
      class="mt-6 block overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/60"
      aria-label="약도 — 지도에서 열기"
    >
      <img :src="directions.image" alt="오시는 길 약도" class="w-full" loading="lazy" />
      <span class="block bg-white/70 py-1.5 text-center text-xs text-ink/55">약도를 누르면 지도에서 열려요</span>
    </a>

    <div class="mt-5 space-y-1 text-center text-sm text-ink/80">
      <p class="inline-flex items-center gap-1">
        <MapPin class="h-4 w-4 text-rosewood-400" /> {{ address }}
      </p>
      <p v-if="wedding.venue.addressDetail">{{ wedding.venue.addressDetail }}</p>
      <p class="text-ink/60">Tel. {{ wedding.venue.tel }}</p>
    </div>

    <!-- 교통 안내: 지하철 · 버스 · 자가용(주차) -->
    <div class="glass-card mt-5 space-y-3.5 p-5 text-sm leading-6 text-ink/80">
      <div v-if="directions.subway" class="flex gap-2.5">
        <TrainFront class="mt-0.5 h-4 w-4 shrink-0 text-aurora-blue" />
        <div class="min-w-0">
          <p class="font-semibold text-ink/90">지하철</p>
          <p class="mt-0.5 whitespace-pre-line">{{ directions.subway }}</p>
        </div>
      </div>
      <div v-if="directions.bus?.length" class="flex gap-2.5">
        <Bus class="mt-0.5 h-4 w-4 shrink-0 text-aurora-mint" />
        <div class="min-w-0">
          <p class="font-semibold text-ink/90">버스</p>
          <p v-for="b in directions.bus" :key="b.stop" class="mt-0.5">
            <span class="text-ink/50">{{ b.stop }}</span> · {{ b.lines }}
          </p>
        </div>
      </div>
      <div v-if="directions.car" class="flex gap-2.5">
        <Car class="mt-0.5 h-4 w-4 shrink-0 text-aurora-pink" />
        <div class="min-w-0">
          <p class="font-semibold text-ink/90">자가용 · 주차</p>
          <p class="mt-0.5">{{ directions.car }}</p>
          <div v-if="directions.parking?.length" class="mt-1.5 space-y-1.5">
            <div v-for="p in directions.parking" :key="p.name">
              <p>
                <span class="text-ink/90">{{ p.name }}</span>
                <span class="text-ink/50"> · {{ p.note }}</span>
              </p>
              <p v-if="p.addr" class="text-xs text-ink/45">{{ p.addr }}</p>
            </div>
          </div>
        </div>
      </div>
      <p
        v-if="directions.notice"
        class="mt-1 border-t border-white/40 pt-3 text-xs leading-5 text-ink/55"
      >
        ※ {{ directions.notice }}
      </p>
    </div>

    <!-- 주소 복사 -->
    <button class="aurora-btn-outline mt-5 w-full" @click="copyAddress">
      <Copy class="h-4 w-4" /> 주소 복사
    </button>

    <!-- 길찾기: 네이버 · 카카오 · 티맵 (한 줄) -->
    <div class="mt-3 grid grid-cols-3 gap-2">
      <a
        :href="naverUrl"
        target="_blank"
        rel="noopener"
        class="glass-card flex flex-col items-center gap-1 py-3 text-xs font-medium text-ink/70"
      >
        <Navigation class="h-5 w-5 text-[#03c75a]" />
        네이버
      </a>
      <a
        :href="kakaoUrl"
        target="_blank"
        rel="noopener"
        class="glass-card flex flex-col items-center gap-1 py-3 text-xs font-medium text-ink/70"
      >
        <Navigation class="h-5 w-5 text-[#e6b800]" />
        카카오
      </a>
      <a
        :href="tmapUrl"
        class="glass-card flex flex-col items-center gap-1 py-3 text-xs font-medium text-ink/70"
      >
        <Navigation class="h-5 w-5 text-aurora-blue" />
        티맵
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
