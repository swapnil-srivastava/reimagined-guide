/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    typography: (theme) => ({}),
    extend: {
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      colors : {
        'blog-black': '#0A0A0A',
        'blog-white': '#FBFBFB',
        'caribbean-green': {
          '50': '#f3fdfb', 
          '100': '#e7fcf6', 
          '200': '#c4f7e9', 
          '300': '#a0f2dc', 
          '400': '#59e8c2', 
          '500': '#12dea8', 
          '600': '#10c897', 
          '700': '#0ea77e', 
          '800': '#0b8565', 
          '900': '#096d52'
      },'dark-blue': {
          '50': '#f7f3fd', 
          '100': '#efe7fc', 
          '200': '#d7c4f7', 
          '300': '#bea0f2', 
          '400': '#8e59e8', 
          '500': '#5d12de', 
          '600': '#5410c8', 
          '700': '#460ea7', 
          '800': '#380b85', 
          '900': '#2e096d'
      },'persian-blue': {
          '50': '#f3f6fd', 
          '100': '#e7edfc', 
          '200': '#c4d2f7', 
          '300': '#a0b6f2', 
          '400': '#5980e8', 
          '500': '#1249de', 
          '600': '#1042c8', 
          '700': '#0e37a7', 
          '800': '#0b2c85', 
          '900': '#09246d'
      }, 'fun-blue': {
        '50': '#f2f6fa', 
        '100': '#e6eef5', 
        '200': '#bfd4e6', 
        '300': '#99bad7', 
        '400': '#4d87ba', 
        '500': '#00539c', 
        '600': '#004b8c', 
        '700': '#003e75', 
        '800': '#00325e', 
        '900': '#00294c'
      }, 'hit-pink': {
        '50': '#fefaf9', 
        '100': '#fdf6f2', 
        '200': '#fbe8df', 
        '300': '#f8dbcc', 
        '400': '#f3bfa5', 
        '500': '#eea47f', 
        '600': '#d69472', 
        '700': '#b37b5f', 
        '800': '#8f624c', 
        '900': '#75503e'
        }
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
