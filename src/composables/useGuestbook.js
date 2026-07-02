import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

// "내가 작성한 글" ID 를 브라우저(localStorage)에 보관 → 같은 기기에서 본인 글만 삭제 허용.
// 비밀번호 없이 가볍게 본인 글 삭제를 지원하기 위한 방식(기기 기준).
const OWNED_KEY = 'guestbook-owned-ids'

function loadOwnedIds() {
  try {
    const raw = localStorage.getItem(OWNED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveOwnedIds(set) {
  try {
    localStorage.setItem(OWNED_KEY, JSON.stringify([...set]))
  } catch {
    /* localStorage 사용 불가 환경은 무시 */
  }
}

// 방명록 로직 캡슐화
// - Firebase 가 설정되어 있으면 Firestore 의 "guestbook" 컬렉션과 실시간 동기화
// - 설정이 없으면(데모 모드) 로컬 메모리 배열로만 동작
export function useGuestbook() {
  const entries = ref([])
  const loading = ref(true)
  const submitting = ref(false)
  const ownedIds = ref(loadOwnedIds())
  let unsubscribe = null

  // 같은 기기에서 작성한 글인지 판별(삭제 버튼 노출 기준)
  const isMine = (id) => ownedIds.value.has(id)

  onMounted(() => {
    if (!db) {
      // 데모 모드: 예시 데이터
      entries.value = [
        {
          id: 'demo-1',
          name: '하객1',
          message: '결혼 축하해요! 행복하게 잘 살아요 💕',
          createdAt: new Date(),
        },
      ]
      loading.value = false
      return
    }

    const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'))
    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        entries.value = snapshot.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            name: data.name,
            message: data.message,
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
          }
        })
        loading.value = false
      },
      (err) => {
        // 보안 규칙 미배포 시 권한 오류가 날 수 있다(앱은 빈 목록으로 정상 동작).
        // firestore.rules 를 배포하면 해결된다: `firebase deploy --only firestore:rules`
        if (err?.code === 'permission-denied') {
          console.warn(
            '[guestbook] 읽기 권한이 없습니다. firestore.rules 를 배포하세요: ' +
              'firebase deploy --only firestore:rules'
          )
        } else {
          console.error('[guestbook] 구독 오류:', err)
        }
        loading.value = false
      }
    )
  })

  onBeforeUnmount(() => {
    if (unsubscribe) unsubscribe()
  })

  async function addEntry({ name, message }) {
    const trimmedName = name?.trim()
    const trimmedMessage = message?.trim()
    if (!trimmedName || !trimmedMessage) return false

    submitting.value = true
    try {
      if (!db) {
        // 데모 모드: 로컬 추가
        const id = `demo-${Date.now()}`
        entries.value.unshift({
          id,
          name: trimmedName,
          message: trimmedMessage,
          createdAt: new Date(),
        })
        ownedIds.value.add(id)
        saveOwnedIds(ownedIds.value)
        return true
      }

      const ref = await addDoc(collection(db, 'guestbook'), {
        name: trimmedName,
        message: trimmedMessage,
        createdAt: serverTimestamp(),
      })
      // 내 글로 기록(같은 기기에서만 삭제 가능)
      ownedIds.value.add(ref.id)
      saveOwnedIds(ownedIds.value)
      return true
    } catch (err) {
      console.error('[guestbook] 저장 오류:', err)
      return false
    } finally {
      submitting.value = false
    }
  }

  // 본인이 작성한 글 삭제(기기 기록 기준). 다른 기기/타인 글은 버튼 자체가 안 보인다.
  async function removeEntry(id) {
    if (!id || !isMine(id)) return false
    try {
      if (!db) {
        // 데모 모드: 로컬 제거
        entries.value = entries.value.filter((e) => e.id !== id)
      } else {
        await deleteDoc(doc(db, 'guestbook', id))
        // onSnapshot 이 목록을 갱신하지만, 즉각 반영을 위해 선반영
        entries.value = entries.value.filter((e) => e.id !== id)
      }
      ownedIds.value.delete(id)
      saveOwnedIds(ownedIds.value)
      return true
    } catch (err) {
      console.error('[guestbook] 삭제 오류:', err)
      return false
    }
  }

  // 관리자용 삭제: 소유권과 무관하게 어떤 글이든 삭제(#/admin 방명록 관리).
  async function removeEntryAsAdmin(id) {
    if (!id) return false
    try {
      if (db) await deleteDoc(doc(db, 'guestbook', id))
      entries.value = entries.value.filter((e) => e.id !== id)
      return true
    } catch (err) {
      console.error('[guestbook] 관리자 삭제 오류:', err)
      return false
    }
  }

  return { entries, loading, submitting, addEntry, removeEntry, removeEntryAsAdmin, isMine }
}
