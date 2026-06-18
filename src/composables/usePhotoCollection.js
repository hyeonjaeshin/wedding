import { ref, onMounted, onBeforeUnmount } from 'vue'
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

// Firestore 사진 컬렉션 공통 로직(구독/업로드/삭제/순서변경).
//  - ordered=true : order 필드 오름차순 + movePhoto 지원(갤러리/커버)
//  - ordered=false: createdAt 내림차순(게스트스냅 — 최신순), movePhoto 없음
// 사진은 클라이언트 압축 후 dataURL 로 저장한다.
export function usePhotoCollection(name, { ordered = true } = {}) {
  const items = ref([]) // { id, dataUrl, order?, name? }
  const submitting = ref(false)
  let unsubscribe = null

  onMounted(() => {
    if (!db) return
    const q = ordered
      ? query(collection(db, name), orderBy('order', 'asc'))
      : query(collection(db, name), orderBy('createdAt', 'desc'))
    unsubscribe = onSnapshot(
      q,
      (snap) => {
        items.value = snap.docs.map((d) => ({
          id: d.id,
          dataUrl: d.data().dataUrl,
          order: d.data().order ?? 0,
          name: d.data().name ?? '',
        }))
      },
      (err) => {
        if (err?.code === 'permission-denied') {
          console.warn(
            `[${name}] 읽기 권한이 없습니다. firestore.rules 를 배포하세요: ` +
              'firebase deploy --only firestore:rules'
          )
        } else {
          console.error(`[${name}] 구독 오류:`, err)
        }
      }
    )
  })

  onBeforeUnmount(() => {
    if (unsubscribe) unsubscribe()
  })

  // 압축된 dataURL 들을 저장. extra 로 문서 추가 필드(예: 업로더 이름)를 넣을 수 있다.
  async function uploadDataUrls(dataUrls, onProgress, extra = {}) {
    if (!db) {
      alert('Firebase 가 설정되지 않아 업로드할 수 없습니다(데모 모드).')
      return { ok: 0, fail: dataUrls.length, ids: [] }
    }
    submitting.value = true
    let ok = 0
    let fail = 0
    const ids = []
    let nextOrder = items.value.reduce((m, u) => Math.max(m, u.order || 0), 0) + 1
    try {
      for (let i = 0; i < dataUrls.length; i++) {
        try {
          const payload = { dataUrl: dataUrls[i], createdAt: serverTimestamp(), ...extra }
          if (ordered) payload.order = nextOrder++
          const refDoc = await addDoc(collection(db, name), payload)
          ids.push(refDoc.id)
          ok++
        } catch (e) {
          console.error(`[${name}] 업로드 실패:`, e)
          fail++
        }
        onProgress?.(i + 1, dataUrls.length)
      }
    } finally {
      submitting.value = false
    }
    return { ok, fail, ids }
  }

  async function removePhoto(id) {
    if (!db) return false
    try {
      await deleteDoc(doc(db, name, id))
      return true
    } catch (e) {
      console.error(`[${name}] 삭제 실패:`, e)
      return false
    }
  }

  // 사진을 위(-1)/아래(+1)로 이동: 이웃과 order 값을 교환 (ordered 전용)
  async function movePhoto(id, direction) {
    if (!db || !ordered) return false
    const list = items.value
    const idx = list.findIndex((u) => u.id === id)
    const swapIdx = idx + direction
    if (idx < 0 || swapIdx < 0 || swapIdx >= list.length) return false
    const a = list[idx]
    const b = list[swapIdx]
    try {
      await Promise.all([
        updateDoc(doc(db, name, a.id), { order: b.order }),
        updateDoc(doc(db, name, b.id), { order: a.order }),
      ])
      return true
    } catch (e) {
      console.error(`[${name}] 순서 변경 실패:`, e)
      return false
    }
  }

  return { items, submitting, uploadDataUrls, removePhoto, movePhoto }
}
