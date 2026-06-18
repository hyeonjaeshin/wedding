import { computed } from 'vue'
import { usePhotoCollection } from './usePhotoCollection'
import { galleryImages } from '../data/invitation'

// 갤러리 = 정적 번들 사진(galleryImages) + 업로드 사진(Storage, Firestore "gallery")
// 정적 사진이 앞, 업로드분이 뒤에 이어진다.
export function useGallery() {
  const { items, submitting, uploadBlobs, removePhoto, movePhoto } = usePhotoCollection('gallery')

  const images = computed(() => [...galleryImages, ...items.value.map((u) => u.src)])

  return { images, uploaded: items, submitting, uploadBlobs, removePhoto, movePhoto }
}
