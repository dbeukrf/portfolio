/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Diego Portfolio Design System Colors
        primary: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          DEFAULT: '#000D7C', // Deep Royal Blue
        },
        secondary: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          DEFAULT: '#4F46E5', // Indigo blue, modern
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#F59E0B', // Amber, warm contrast
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          DEFAULT: '#10B981', // Emerald green
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#F59E0B', // Amber (same as accent)
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          DEFAULT: '#EF4444', // Red, clear alert
        },
        background: {
          dark: '#0F172A', // Slate 900, rich dark
          light: '#1E293B', // Slate 800
          DEFAULT: '#0F172A',
        },
        text: {
          primary: '#F8FAFC', // Slate 50, high contrast
          secondary: '#CBD5E1', // Slate 300, readable
          DEFAULT: '#F8FAFC',
        },
        border: {
          DEFAULT: '#334155', // Slate 700, subtle
          light: '#475569', // Slate 600
          dark: '#1e293b', // Slate 800
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
      fontSize: {
        // Heading sizes
        'h1': ['48px', { lineHeight: '1.2', fontWeight: '700' }], // 3rem
        'h2': ['36px', { lineHeight: '1.3', fontWeight: '600' }], // 2.25rem
        'h3': ['24px', { lineHeight: '1.4', fontWeight: '600' }], // 1.5rem
        'h4': ['20px', { lineHeight: '1.5', fontWeight: '600' }], // 1.25rem
        
        // Body text sizes
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }], // 1.125rem
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }], // 1rem
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }], // 0.875rem
        'tiny': ['12px', { lineHeight: '1.4', fontWeight: '500' }], // 0.75rem
      },
      spacing: {
        // Design system spacing scale (4px base unit)
        'xs': '4px',    // 0.25rem
        'sm': '8px',    // 0.5rem
        'md': '12px',   // 0.75rem
        'base': '16px', // 1rem
        'lg': '24px',   // 1.5rem
        'xl': '32px',   // 2rem
        '2xl': '48px',  // 3rem
        '3xl': '64px',  // 4rem
        '4xl': '96px',  // 6rem
        
        // Additional spacing for specific use cases
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'sm': '4px',
        'base': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      screens: {
        'mobile': '320px',
        'tablet': '768px',
        'desktop': '1024px',
        'wide': '1280px',
      },
    },
  },
  plugins: [],
}

