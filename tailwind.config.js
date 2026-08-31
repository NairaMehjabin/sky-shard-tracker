/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        buttons: ['var(--font-buttons)', 'sans-serif'],
        curly: ['var(--font-curly)', 'cursive'],
        typewriter: ['ui-monospace', 'SFMono-Regular', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};