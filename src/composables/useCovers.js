import { computed } from 'vue'
import { usePhotoCollection } from './usePhotoCollection'
import { coverImages } from '../data/invitation'

// 커버 사진 = 정적 번들 사진(coverImages) + 업로드 사진(Firestore "covers")
// 관리자 페이지에서 업로드/순서변경/삭제. 정적 사진이 앞, 업로드분이 뒤에 이어진다.
export function useCovers() {
  const { items, submitting, uploadDataUrls, removePhoto, movePhoto } = usePhotoCollection('covers')

  const images = computed(() => [...coverImages, ...items.value.map((u) => u.dataUrl)])

  return { images, uploaded: items, submitting, uploadDataUrls, removePhoto, movePhoto }
}
