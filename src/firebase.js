// Firebase 초기화 모듈
// - .env 의 VITE_FIREBASE_* 값으로 앱을 초기화한다.
// - 값이 없으면(키 미설정) 앱을 초기화하지 않고 db = null 을 반환한다.
//   이 경우 방명록/RSVP 는 "데모 모드"(로컬 메모리)로 동작하여
//   키 없이도 UI 를 시연할 수 있다. (composables 참고)
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// 필수 키가 채워졌는지 확인
const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let db = null

if (isConfigured) {
  const app = initializeApp(firebaseConfig)
  db = getFirestore(app)

  // Analytics 는 브라우저 환경에서 지원될 때만 안전하게 초기화
  if (firebaseConfig.measurementId) {
    isSupported()
      .then((ok) => {
        if (ok) getAnalytics(app)
      })
      .catch(() => {})
  }
} else {
  console.warn(
    '[firebase] 환경변수가 설정되지 않아 데모 모드로 동작합니다. ' +
      '.env.example 을 참고하여 .env 를 작성하면 방명록/RSVP 가 실제로 저장됩니다.'
  )
}

export { db, isConfigured }
