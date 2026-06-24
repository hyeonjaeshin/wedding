import confetti from 'canvas-confetti'

// 축하 컨피티 효과 (RSVP 제출 / 방명록 등록 성공 시)
// 파스텔 오로라 색상으로, 모바일 성능을 위해 파티클 수를 제한한다.
const AURORA_COLORS = ['#f7a8c8', '#c4a9f0', '#8fc7f0', '#8ad9c0', '#ffffff']

export function useConfetti() {
  // 사용자가 모션 최소화를 켰으면 효과를 생략
  function prefersReducedMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  }

  function celebrate() {
    if (prefersReducedMotion()) return

    const base = {
      colors: AURORA_COLORS,
      disableForReducedMotion: true,
      scalar: 0.9,
    }

    // 양쪽에서 부드럽게 터뜨리기
    confetti({ ...base, particleCount: 60, spread: 70, origin: { x: 0.2, y: 0.7 } })
    confetti({ ...base, particleCount: 60, spread: 70, origin: { x: 0.8, y: 0.7 } })
    setTimeout(() => {
      confetti({ ...base, particleCount: 40, spread: 100, startVelocity: 35, origin: { x: 0.5, y: 0.6 } })
    }, 180)
  }

  // 할로윈 이스터에그용 이모지 컨피티(귀엽고 화사하되 과하지 않게)
  function halloween() {
    if (prefersReducedMotion()) return
    const shapes = ['🎃', '👻', '🦇', '🍬', '⭐'].map((text) =>
      confetti.shapeFromText({ text, scalar: 2 })
    )
    const base = { shapes, scalar: 2, disableForReducedMotion: true, ticks: 240 }
    // 양쪽 + 가운데 + 위쪽 한 번 더 (화사하게 4버스트, 과하지 않게)
    confetti({ ...base, particleCount: 34, spread: 80, origin: { x: 0.2, y: 0.62 } })
    confetti({ ...base, particleCount: 34, spread: 80, origin: { x: 0.8, y: 0.62 } })
    setTimeout(() => {
      confetti({ ...base, particleCount: 30, spread: 120, startVelocity: 34, origin: { x: 0.5, y: 0.5 } })
    }, 150)
    setTimeout(() => {
      confetti({ ...base, particleCount: 18, spread: 95, origin: { x: 0.5, y: 0.4 } })
    }, 560)
  }

  return { celebrate, halloween }
}
