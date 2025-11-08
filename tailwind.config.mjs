/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // Custom gamer color palette
      colors: {
        // Dark backgrounds
        'dark-bg': '#0a0a0f',
        'dark-surface': '#1a1a2e',
        'dark-card': '#1e1e2e',
        'dark-card-hover': '#2a2a3e',
        // Neon accents
        'neon-cyan': '#00f5ff',
        'neon-purple': '#8b5cf6',
        // Text colors
        'text-primary': '#e0e0e0',
        'text-secondary': '#a0a0a0',
        // Platform colors
        'platform-steam': '#1b2838',
        'platform-playstation': '#003087',
        'platform-xbox': '#107c10',
        'platform-switch': '#e60012',
        'platform-pc': '#6c757d',
      },
      // Custom fonts
      fontFamily: {
        'heading': ['Orbitron', 'Inter', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      // Custom animations
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 245, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.8), 0 0 30px rgba(0, 245, 255, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // Custom box shadows for glow effects
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0, 245, 255, 0.5), 0 0 20px rgba(0, 245, 255, 0.3)',
        'neon-purple': '0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
      },
    },
  },
  plugins: [],
}

