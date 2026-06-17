import { ref } from 'vue'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

// 참석 여부(RSVP) 제출 로직
// - Firestore "rsvp" 컬렉션에 저장 (보안 규칙상 읽기는 관리자 콘솔에서만)
// - 데모 모드에서는 콘솔에만 기록
export function useRsvp() {
  const submitting = ref(false)
  const submitted = ref(false)

  async function submit(form) {
    const name = form.name?.trim()
    if (!name || !['yes', 'no'].includes(form.attending)) return false

    submitting.value = true
    try {
      const payload = {
        name,
        attending: form.attending, // 'yes' | 'no'
        side: form.side || '', // '신랑측' | '신부측'
        count: Number(form.count) || 1, // 참석 인원
        meal: form.meal || '', // 식사 여부
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

  return { submitting, submitted, submit }
}
