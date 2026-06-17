import { onMounted, onBeforeUnmount } from 'vue'

// IntersectionObserver 로 ".reveal" 요소가 화면에 들어오면 ".is-visible" 을 붙여
// 부드러운 등장 애니메이션을 적용한다. (style.css 의 .reveal 규칙과 연동)
export function useScrollReveal(selector = '.reveal') {
  let observer

  onMounted(() => {
    const elements = document.querySelectorAll(selector)
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'))
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    elements.forEach((el) => observer.observe(el))
  })

  onBeforeUnmount(() => {
    if (observer) observer.disconnect()
  })
}
