/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#FCFBFD',
        surface: '#FFFFFF',
        ink: '#15142C',
        muted: '#777789',
        brand: '#4D5CF5',
        'brand-dark': '#3F27B8',
        accent: '#FFC328',
        danger: '#FB596A',
        success: '#64C84A',
        cyan: '#10BFC5',
        violet: '#8A2BE8',
        fuchsia: '#C43BE4',
        orange: '#FFA51F',
        coral: '#FB596A',
        border: '#ECEAF2',
        lavender: '#F0ECFF',
        'lavender-dark': '#E4DDFE',
      },
      borderRadius: {
        card: '24px',
        control: '16px',
      },
    },
  },
  plugins: [],
};
