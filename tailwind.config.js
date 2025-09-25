/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.tsx',
    './context/**/*.tsx',
    './hooks/**/*.ts',
    './lib/**/*.ts',
    './services/**/*.ts',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
