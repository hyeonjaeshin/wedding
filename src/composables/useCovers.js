import { computed } from 'vue'
import { usePhotoCollection } from './usePhotoCollection'
import { coverImages } from '../data/invitation'

// 커버 사진 = 정적 번들 사진(coverImages) + 업로드 사진(Storage, Firestore "covers")
export function useCovers() {
  const { items, submitting, uploadBlobs, removePhoto, movePhoto } = usePhotoCollection('covers')

  const images = computed(() => [...coverImages, ...items.value.map((u) => u.src)])

  return { images, uploaded: items, submitting, uploadBlobs, removePhoto, movePhoto }
}
