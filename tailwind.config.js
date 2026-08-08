/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F8F3',
        surface: '#FFFFFF',
        ink: '#18201A',
        muted: '#657168',
        brand: '#215C45',
        'brand-dark': '#154333',
        accent: '#D9A441',
        danger: '#B43B3B',
        border: '#DDE3DD',
      },
      borderRadius: {
        card: '24px',
        control: '16px',
      },
    },
  },
  plugins: [],
};
