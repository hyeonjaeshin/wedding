import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { galleryImages } from '../data/invitation'

// 갤러리 사진 = 정적 번들 사진(galleryImages) + 업로드 사진(Firestore "gallery")
// - db 가 없으면(데모) 정적 사진만 사용
// - 업로드는 클라이언트 압축 후 dataURL 을 Firestore 에 저장
// - order 필드로 순서를 관리(관리자 페이지에서 위/아래 이동)
export function useGallery() {
  const uploaded = ref([]) // { id, dataUrl, order }
  const submitting = ref(false)
  let unsubscribe = null

  onMounted(() => {
    if (!db) return
    const q = query(collection(db, 'gallery'), orderBy('order', 'asc'))
    unsubscribe = onSnapshot(
      q,
      (snap) => {
        uploaded.value = snap.docs.map((d) => ({
          id: d.id,
          dataUrl: d.data().dataUrl,
          order: d.data().order ?? 0,
        }))
      },
      (err) => {
        if (err?.code === 'permission-denied') {
          console.warn(
            '[gallery] 읽기 권한이 없습니다. firestore.rules 를 배포하세요: ' +
              'firebase deploy --only firestore:rules'
          )
        } else {
          console.error('[gallery] 구독 오류:', err)
        }
      }
    )
  })

  onBeforeUnmount(() => {
    if (unsubscribe) unsubscribe()
  })

  // 정적 사진 뒤에 업로드 사진을 이어붙인 최종 목록
  const images = computed(() => [...galleryImages, ...uploaded.value.map((u) => u.dataUrl)])

  // 이미 압축된 dataURL 들을 Firestore 에 저장. 진행 상황 콜백 제공.
  async function uploadDataUrls(dataUrls, onProgress) {
    if (!db) {
      alert('Firebase 가 설정되지 않아 업로드할 수 없습니다(데모 모드).')
      return { ok: 0, fail: dataUrls.length }
    }
    submitting.value = true
    let ok = 0
    let fail = 0
    // 기존 최대 order 뒤에 이어 붙인다
    let nextOrder = uploaded.value.reduce((m, u) => Math.max(m, u.order), 0) + 1
    try {
      for (let i = 0; i < dataUrls.length; i++) {
        try {
          await addDoc(collection(db, 'gallery'), {
            dataUrl: dataUrls[i],
            order: nextOrder++,
            createdAt: serverTimestamp(),
          })
          ok++
        } catch (e) {
          console.error('[gallery] 업로드 실패:', e)
          fail++
        }
        onProgress?.(i + 1, dataUrls.length)
      }
    } finally {
      submitting.value = false
    }
    return { ok, fail }
  }

  async function removePhoto(id) {
    if (!db) return false
    try {
      await deleteDoc(doc(db, 'gallery', id))
      return true
    } catch (e) {
      console.error('[gallery] 삭제 실패:', e)
      return false
    }
  }

  // 사진을 위(-1)/아래(+1)로 이동: 이웃과 order 값을 교환
  async function movePhoto(id, direction) {
    if (!db) return false
    const list = uploaded.value
    const idx = list.findIndex((u) => u.id === id)
    const swapIdx = idx + direction
    if (idx < 0 || swapIdx < 0 || swapIdx >= list.length) return false
    const a = list[idx]
    const b = list[swapIdx]
    try {
      await Promise.all([
        updateDoc(doc(db, 'gallery', a.id), { order: b.order }),
        updateDoc(doc(db, 'gallery', b.id), { order: a.order }),
      ])
      return true
    } catch (e) {
      console.error('[gallery] 순서 변경 실패:', e)
      return false
    }
  }

  return { images, uploaded, submitting, uploadDataUrls, removePhoto, movePhoto }
}
