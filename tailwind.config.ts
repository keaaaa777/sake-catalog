import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sumi: {
          DEFAULT: '#15130f',
          light: '#211c16',
          dark: '#0b0a08',
        },
        washi: {
          DEFAULT: '#f7f2e7',
          dim: '#efe7d6',
        },
        gold: {
          DEFAULT: '#c8a24a',
          light: '#e2c789',
          dark: '#9c7a2e',
        },
        kurenai: '#7c2130',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
