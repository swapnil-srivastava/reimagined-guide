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
      minHeight: {
        '96': '24rem',  // Ensure this value is present
      },
      fontFamily: {
        inter: ['var(--font-inter)'],
        roboto: ['var(--font-roboto)'],
        salsa: ['var(--font-salsa)'],
        bungee: ['var(--font-bungee)'],
        poppins: ['var(--font-poppins)'],
        greatVibes: ['var(--font-greatVibes)'],
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      animation: {
        'infinite-scroll': 'infinite-scroll 26s linear infinite',
        'infinite-reverse': 'infinite-scroll 35s linear infinite reverse',
        'blob': 'blob 7s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-slow': 'bounce 2s infinite',
        'ping-slow': 'ping 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient': 'gradient 3s ease infinite',
        'scan': 'scan 2s linear infinite',
        'matrix': 'matrix 20s linear infinite',
        'quantum': 'quantum 4s ease-in-out infinite',
      },
      keyframes: {
        'infinite-scroll': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'infinite-reverse': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        'blob': {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'scan': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'matrix': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'quantum': {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.1) rotate(90deg)' },
          '50%': { transform: 'scale(0.9) rotate(180deg)' },
          '75%': { transform: 'scale(1.05) rotate(270deg)' },
        },
      },
      colors : {
        'blog-black': '#0A0A0A',
        'blog-white': '#FBFBFB',
        'primary-blue': '#1249de',
        'blue-secondary': '#385dc5',
        'fun-blue-500': '#00539c',
        'purple-accent': '#5d12de',
        'teal-accent': '#12dea8',
        'peach-accent': '#eea47f',
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
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cosmic': 'linear-gradient(45deg, #000000 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
        'quantum': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'neural': 'linear-gradient(45deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #54a0ff 100%)',
      },
      perspective: {
        '1000': '1000px',
        '1500': '1500px',
        '2000': '2000px',
      },
      transformStyle: {
        'preserve-3d': 'preserve-3d',
      },
      backfaceVisibility: {
        'hidden': 'hidden',
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
