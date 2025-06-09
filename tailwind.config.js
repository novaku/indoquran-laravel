/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
    "./resources/**/*.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Scheherazade New', 'Scheherazade', 'Noto Naskh Arabic', 'serif'],
        sans: ['Inter', 'Noto Sans', 'ui-sans-serif', 'system-ui'],
        serif: ['Playfair Display', 'ui-serif', 'Georgia'],
        amiri: ['Amiri', 'serif'],
      },
      colors: {
        primary: {
          50: '#f8f7f2',
          100: '#f0ede3',
          200: '#e8e4d4',
          300: '#d9d1b8',
          400: '#c7ba99',
          500: '#a79878',
          600: '#8e7e5c',
          700: '#6d6049',
          800: '#5a5040',
          900: '#4a4236',
        },
        secondary: {
          50: '#f9f7f3',
          100: '#f2ece2',
          200: '#e5dacb',
          300: '#d5c4aa',
          400: '#c3ab88',
          500: '#b3956f',
          600: '#9f8160',
          700: '#846b52',
          800: '#6c5845',
          900: '#5a4a3b',
        },
        accent: {
          50: '#faf7ef',
          100: '#f5eede',
          200: '#ead8b6',
          300: '#dec088',
          400: '#d1a662',
          500: '#c38d3e',
          600: '#b67b30',
          700: '#96622a',
          800: '#7b502b',
          900: '#654427',
        },
        islamic: {
          green: '#116937',
          gold: '#b67b30',
          cream: '#f8f7f2',
          beige: '#f0ede3',
          parchment: '#faf8f2',
          brown: '#6d5c3f',
          dark: '#4a4236',
          light: '#f9f7f3'
        }
      },
      borderWidth: {
        '3': '3px',
        '5': '5px',
        '6': '6px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'islamic-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236d5c3f' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='30'/%3E%3C/g%3E%3C/svg%3E\")",
        'parchment-texture': "url('data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.035'/%3E%3C/svg%3E')",
        'geometric-pattern': "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236d5c3f' fill-opacity='0.04'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'islamic': '0 8px 32px rgba(74, 66, 54, 0.08)',
        'islamic-md': '0 12px 48px rgba(74, 66, 54, 0.12)',
        'islamic-lg': '0 16px 64px rgba(74, 66, 54, 0.16)',
        'gold': '0 4px 16px rgba(182, 123, 48, 0.3)',
        'gold-lg': '0 8px 32px rgba(182, 123, 48, 0.4)',
        'parchment': '0 1px 3px rgba(109, 92, 63, 0.1), 0 8px 24px rgba(109, 92, 63, 0.08)',
      },
      typography: {
        DEFAULT: {
          css: {
            '.arabic-text': {
              direction: 'rtl',
              textAlign: 'right',
              fontFamily: 'Noto Naskh Arabic, Scheherazade, serif',
            },
          },
        },
      },
    },
  },
  plugins: [
    // Use import instead of require for ESM
    (await import('@tailwindcss/typography')).default,
    (await import('@tailwindcss/forms')).default,
  ],
}
