import { createApp } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import App from './App.vue'
import './style.css'

createApp(App)
  .use(MotionPlugin) // v-motion 디렉티브 (스크롤/등장 애니메이션)
  .use(autoAnimatePlugin) // v-auto-animate 디렉티브 (리스트 부드러운 전환)
  .mount('#app')
