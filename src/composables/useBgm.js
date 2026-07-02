import { ref, onMounted, onBeforeUnmount } from 'vue'

// 배경음악(BGM) 재생 상태 관리
// - 모바일 브라우저는 사용자의 첫 상호작용 전 자동재생을 막으므로,
//   첫 탭/클릭 시 재생을 시도한다.
export function useBgm(input) {
  // input: 문자열 1곡 | 문자열 배열(무작위 1곡 선택) | falsy(없음)
  const list = Array.isArray(input) ? input.filter(Boolean) : input ? [input] : []
  const src = list.length ? list[Math.floor(Math.random() * list.length)] : null

  const playing = ref(false)
  const available = ref(Boolean(src))
  let audio = null

  function ensureAudio() {
    if (!audio && src) {
      audio = new Audio(src)
      audio.loop = true
      audio.volume = 0.5
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
    pause()
    audio = null
  })

  return { playing, available, play, pause, toggle }
}
