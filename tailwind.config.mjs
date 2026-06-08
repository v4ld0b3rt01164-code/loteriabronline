/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F0F1E',
        surface: '#1A1A2E',
        'surface-2': '#16213E',
        accent: '#00D9FF',
        'accent-hover': '#00B8D4',
        'accent-alt': '#7F39FB',
        success: '#10B981',
        'text-primary': '#F8F9FA',
        'text-secondary': '#A0A0A0',
        'text-muted': '#787878',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Arial', 'Helvetica', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      maxWidth: {
        grid: '1280px',
      },
      gridTemplateColumns: {
        'auto-fill-2': 'repeat(auto-fill, minmax(200px, 1fr))',
        'auto-fill-sm': 'repeat(2, 1fr)',
      },
      animation: {
        'gradient': 'gradient 3s ease infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 217, 255, 0.3)',
        'glow-purple': '0 0 20px rgba(127, 57, 251, 0.3)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
