import { ref } from 'vue'
import { usePhotoCollection } from './usePhotoCollection'

// 게스트스냅 = 하객 누구나 올리는 사진(Firestore "guestsnaps", 공개·최신순).
// 업로더 본인은 같은 기기에서 삭제 가능(localStorage owned-id), 관리자도 삭제 가능.
const OWNED_KEY = 'guestsnap-owned-ids'

function loadOwned() {
  try {
    return new Set(JSON.parse(localStorage.getItem(OWNED_KEY) || '[]'))
  } catch {
    return new Set()
  }
}
function saveOwned(set) {
  try {
    localStorage.setItem(OWNED_KEY, JSON.stringify([...set]))
  } catch {
    /* 무시 */
  }
}

export function useGuestsnap() {
  const { items, submitting, uploadBlobs, removePhoto } = usePhotoCollection('guestsnaps', {
    ordered: false,
  })
  const ownedIds = ref(loadOwned())
  const isMine = (id) => ownedIds.value.has(id)

  // 게스트 사진 업로드(이름 옵션). 성공한 문서 id 를 내 것으로 기록.
  async function uploadSnaps(blobs, name, onProgress) {
    const extra = name?.trim() ? { name: name.trim().slice(0, 30) } : {}
    const res = await uploadBlobs(blobs, onProgress, extra)
    for (const id of res.ids) ownedIds.value.add(id)
    saveOwned(ownedIds.value)
    return res
  }

  async function removeMine(id) {
    if (!isMine(id)) return false
    const ok = await removePhoto(id)
    if (ok) {
      ownedIds.value.delete(id)
      saveOwned(ownedIds.value)
    }
    return ok
  }

  return { items, submitting, uploadSnaps, removePhoto, removeMine, isMine }
}
