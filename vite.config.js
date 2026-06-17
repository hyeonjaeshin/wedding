import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// Vite 설정: Vue SFC 플러그인 등록, 개발 서버 포트 지정
export default defineConfig({
  plugins: [
    vue(),
    // 빌드 시 이미지 자동 압축(품질). public 폴더 사진 포함.
    // 치수 리사이즈는 `npm run optimize:images`(scripts/optimize-images.mjs)에서 처리.
    ViteImageOptimizer({
      includePublic: true,
      logStats: true,
      // SVG 는 제외(svgo 미설치). 래스터 이미지만 압축.
      test: /\.(jpe?g|png|webp)$/i,
      jpg: { quality: 72, progressive: true },
      jpeg: { quality: 72, progressive: true },
      png: { quality: 75 },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // 무거운 라이브러리를 별도 청크로 분리하여 초기 로딩/캐싱 최적화
        manualChunks: {
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/analytics'],
          swiper: ['swiper', 'swiper/vue', 'swiper/modules'],
        },
      },
    },
  },
})
