/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        accent: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        evidence: {
          sourced:       { bg: '#dcfce7', text: '#166534', border: '#86efac' },
          userprovided:  { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
          inferred:      { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
          recommendation:{ bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' },
          needsreview:   { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
        },
      },
    },
  },
  plugins: [],
};

