import { computed } from 'vue'
import { usePhotoCollection } from './usePhotoCollection'
import { coverImages } from '../data/invitation'

// 커버 사진 = 정적 번들 사진(coverImages) + 업로드 사진(Firestore "covers")
// 관리자 페이지에서 업로드/순서변경/삭제. 정적 사진이 앞, 업로드분이 뒤에 이어진다.
export function useCovers() {
  const { items, submitting, uploadDataUrls, removePhoto, movePhoto } = usePhotoCollection('covers', {
    cacheKey: 'wedding-cover-cache',
    cacheLimit: 1, // 첫 커버만 캐시 → 재방문 시 즉시 표시
  })

  // 업로드된 커버(Firestore/캐시)가 있으면 그걸로, 없으면 정적 기본 커버(로딩 포스터).
  // → 첫 로딩엔 번들된 정적 커버가 즉시 뜨고, Firestore 커버 로드되면 자연스럽게 전환(중복 없음).
  const images = computed(() =>
    items.value.length ? items.value.map((u) => u.dataUrl) : coverImages
  )

  return { images, uploaded: items, submitting, uploadDataUrls, removePhoto, movePhoto }
}
