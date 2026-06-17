/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      // 밝은 파스텔 웨딩 팔레트 (크림 / 민트세이지 / 로즈핑크)
      colors: {
        cream: {
          50: '#fffdfa',
          100: '#fdf6f2',
          200: '#f6ebe6',
        },
        sage: {
          400: '#a8d5c4',
          500: '#7fbfa8',
          600: '#5fa288',
        },
        rosewood: {
          300: '#f4c4cf',
          400: '#eaa0b3',
          500: '#d97a93',
        },
        // 오로라 그라데이션 구성용 파스텔 토큰
        aurora: {
          pink: '#f7a8c8',
          lilac: '#c4a9f0',
          blue: '#8fc7f0',
          mint: '#8ad9c0',
        },
        ink: '#4a4550',
      },
      fontFamily: {
        serif: ['"Nanum Myeongjo"', 'serif'],
        sans: ['"Pretendard"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slowZoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
        bounceDown: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(8px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.8s ease-out forwards',
        slowZoom: 'slowZoom 6s ease-out forwards',
        bounceDown: 'bounceDown 1.6s ease-in-out infinite',
        float: 'float 3.5s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}
