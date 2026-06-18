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
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'

// Firestore 사진 컬렉션 공통 로직.
//  - 사진 파일은 Firebase Storage 에 저장하고, Firestore 에는 다운로드 URL + 경로(path)만 보관
//    → 문서가 가벼워 로딩이 빠르고, 원본급 화질을 유지한다.
//  - 과거에 dataURL 로 저장된 문서도 그대로 표시(하위호환: src = url || dataUrl).
//  - ordered=true: order 필드 오름차순 + movePhoto(갤러리/커버), false: createdAt 내림차순(게스트스냅)
export function usePhotoCollection(name, { ordered = true } = {}) {
  const items = ref([]) // { id, src, path, order?, name? }
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
        items.value = snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            src: data.url || data.dataUrl || '', // Storage URL 우선, 없으면 레거시 dataURL
            path: data.path || '', // Storage 경로(삭제용)
            order: data.order ?? 0,
            name: data.name ?? '',
          }
        })
      },
      (err) => {
        if (err?.code === 'permission-denied') {
          console.warn(`[${name}] 읽기 권한이 없습니다. firestore.rules 를 배포하세요.`)
        } else {
          console.error(`[${name}] 구독 오류:`, err)
        }
      }
    )
  })

  onBeforeUnmount(() => {
    if (unsubscribe) unsubscribe()
  })

  // 압축된 Blob 들을 Storage 에 올리고 Firestore 에 메타(url/path) 저장. extra 로 추가 필드(이름 등).
  async function uploadBlobs(blobs, onProgress, extra = {}) {
    if (!db || !storage) {
      alert('Storage 가 설정되지 않아 업로드할 수 없습니다.')
      return { ok: 0, fail: blobs.length, ids: [] }
    }
    submitting.value = true
    let ok = 0
    let fail = 0
    const ids = []
    let nextOrder = items.value.reduce((m, u) => Math.max(m, u.order || 0), 0) + 1
    try {
      for (let i = 0; i < blobs.length; i++) {
        try {
          const path = `${name}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
          const sref = storageRef(storage, path)
          await uploadBytes(sref, blobs[i], { contentType: 'image/jpeg' })
          const url = await getDownloadURL(sref)
          const payload = { url, path, createdAt: serverTimestamp(), ...extra }
          if (ordered) payload.order = nextOrder++
          const refDoc = await addDoc(collection(db, name), payload)
          ids.push(refDoc.id)
          ok++
        } catch (e) {
          console.error(`[${name}] 업로드 실패:`, e)
          fail++
        }
        onProgress?.(i + 1, blobs.length)
      }
    } finally {
      submitting.value = false
    }
    return { ok, fail, ids }
  }

  async function removePhoto(id) {
    if (!db) return false
    const item = items.value.find((u) => u.id === id)
    try {
      // Storage 파일이 있으면 함께 삭제(레거시 dataURL 문서는 path 없음)
      if (item?.path && storage) {
        try {
          await deleteObject(storageRef(storage, item.path))
        } catch (e) {
          if (e?.code !== 'storage/object-not-found') console.warn(`[${name}] 파일 삭제 경고:`, e)
        }
      }
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

  return { items, submitting, uploadBlobs, removePhoto, movePhoto }
}
