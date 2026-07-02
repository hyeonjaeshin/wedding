import { ref, onMounted, onBeforeUnmount } from 'vue'

// 배경음악(BGM) 재생 상태 관리 (플레이리스트)
// - 여러 곡을 순서대로 재생: 한 곡이 끝나면 다음 곡, 마지막 곡이 끝나면 처음부터 반복.
// - 시작 곡은 매 방문마다 무작위로 골라 변화를 준다.
// - 모바일 브라우저는 첫 상호작용 전 자동재생을 막으므로, 첫 탭/클릭 시 재생을 시도한다.
export function useBgm(input) {
  const list = Array.isArray(input) ? input.filter(Boolean) : input ? [input] : []
  const playing = ref(false)
  const available = ref(list.length > 0)
  // 시작 곡 무작위
  let index = list.length ? Math.floor(Math.random() * list.length) : 0
  let audio = null

  function onEnded() {
    if (!audio || !list.length) return
    index = (index + 1) % list.length // 다음 곡(마지막이면 처음으로)
    audio.src = list[index]
    audio.play().catch(() => {})
  }

  function ensureAudio() {
    if (!audio && list.length) {
      audio = new Audio(list[index])
      audio.loop = false // 같은 곡 반복 X — 끝나면 onEnded 로 다음 곡
      audio.volume = 0.5
      audio.addEventListener('ended', onEnded)
    }
    return audio
  }

  async function play() {
    const a = ensureAudio()
    if (!a) return
    try {
      await a.play()
      playing.value = true
    } catch {
      playing.value = false
    }
  }

  function pause() {
    if (audio) {
      audio.pause()
      playing.value = false
    }
  }

  function toggle() {
    if (playing.value) pause()
    else play()
  }

  // 첫 사용자 상호작용 시 자동 재생 시도 (한 번만)
  function tryAutoplayOnInteraction() {
    if (!available.value) return
    const handler = () => {
      play()
      window.removeEventListener('click', handler)
      window.removeEventListener('touchstart', handler)
    }
    window.addEventListener('click', handler, { once: true })
    window.addEventListener('touchstart', handler, { once: true })
  }

  onMounted(() => {
    tryAutoplayOnInteraction()
  })

  onBeforeUnmount(() => {
    if (audio) {
      audio.removeEventListener('ended', onEnded)
      audio.pause()
    }
    audio = null
  })

  return { playing, available, play, pause, toggle }
}
