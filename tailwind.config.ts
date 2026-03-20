import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main':    'var(--bg-main)',
        'bg-card':    'var(--bg-card)',
        'accent-purple': 'var(--accent-purple)',
        'accent-green':  'var(--accent-green)',
        'accent-gold':   'var(--accent-gold)',
        'accent-orange': 'var(--accent-orange)',
        'accent-blue':   'var(--accent-blue)',
        'text-primary':  'var(--text-primary)',
        'text-secondary':'var(--text-secondary)',
        border:          'var(--border)',
      },
    },
  },
  plugins: [],
};
export default config;
