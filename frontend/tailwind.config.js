/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0eefe',
          200: '#bedcfd',
          300: '#8ec3fb',
          400: '#5aa3f7',
          500: '#2f81ef',
          600: '#1c63dc',
          700: '#1850b3',
          800: '#19458d',
          900: '#1a3c72',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
