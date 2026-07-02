import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

// 참석 여부(RSVP)
// - submit: "rsvp" 컬렉션에 저장
// - subscribe:true (관리자 전용)일 때만 목록을 실시간 구독해 통계를 계산한다.
//   (일반 방문 페이지에서는 구독하지 않아 불필요한 읽기가 없음)
export function useRsvp({ subscribe = false } = {}) {
  const submitting = ref(false)
  const submitted = ref(false)
  const entries = ref([])
  const loading = ref(subscribe)
  let unsubscribe = null

  if (subscribe) {
    onMounted(() => {
      if (!db) {
        loading.value = false
        return
      }
      const q = query(collection(db, 'rsvp'), orderBy('createdAt', 'desc'))
      unsubscribe = onSnapshot(
        q,
        (snap) => {
          entries.value = snap.docs.map((d) => {
            const x = d.data()
            return {
              id: d.id,
              name: x.name,
              attending: x.attending,
              side: x.side || '',
              count: Number(x.count) || 1,
              meal: x.meal || '',
              memo: x.memo || '',
              createdAt: x.createdAt?.toDate?.() ?? null,
            }
          })
          loading.value = false
        },
        (err) => {
          if (err?.code === 'permission-denied') {
            console.warn('[rsvp] 읽기 권한이 없습니다. firestore.rules 를 배포하세요.')
          } else {
            console.error('[rsvp] 구독 오류:', err)
          }
          loading.value = false
        }
      )
    })
    onBeforeUnmount(() => {
      if (unsubscribe) unsubscribe()
    })
  }

  // 참석 통계(참석은 인원 수 합산, 불참은 응답 수)
  const stats = computed(() => {
    const yes = entries.value.filter((e) => e.attending === 'yes')
    const no = entries.value.filter((e) => e.attending === 'no')
    const sum = (arr) => arr.reduce((s, e) => s + (e.count || 1), 0)
    return {
      responses: entries.value.length,
      attendingResponses: yes.length,
      declineResponses: no.length,
      headcount: sum(yes), // 총 참석 인원
      groom: sum(yes.filter((e) => e.side === '신랑측')),
      bride: sum(yes.filter((e) => e.side === '신부측')),
      mealYes: sum(yes.filter((e) => e.meal === 'yes')),
      mealNo: sum(yes.filter((e) => e.meal === 'no')),
      mealUndecided: sum(yes.filter((e) => e.meal === 'undecided')),
    }
  })

  async function submit(form) {
    const name = form.name?.trim()
    if (!name || !['yes', 'no'].includes(form.attending)) return false

    submitting.value = true
    try {
      const payload = {
        name,
        attending: form.attending,
        side: form.side || '',
        count: Number(form.count) || 1,
        meal: form.meal || '',
        memo: form.memo?.trim() || '',
        createdAt: serverTimestamp(),
      }

      if (!db) {
        console.info('[rsvp] (데모 모드) 제출 내용:', payload)
      } else {
        await addDoc(collection(db, 'rsvp'), payload)
      }

      submitted.value = true
      return true
    } catch (err) {
      console.error('[rsvp] 저장 오류:', err)
      return false
    } finally {
      submitting.value = false
    }
  }

  return { submitting, submitted, submit, entries, stats, loading }
}
