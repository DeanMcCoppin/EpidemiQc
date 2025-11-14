/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Quebec government branding
        'quebec-blue': '#095797',
        'quebec-blue-dark': '#06345A',
        'quebec-blue-light': '#3A8ECC',
        'quebec-red': '#E31C3D',
        'quebec-gray': '#F5F5F5',
      },
    },
  },
  plugins: [],
};
