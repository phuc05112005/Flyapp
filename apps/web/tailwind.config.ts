import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d8f0ff',
          500: '#0988c8',
          600: '#006fa8',
          700: '#075b86'
        },
        coral: '#f05d4f',
        ink: '#172033'
      },
      boxShadow: {
        soft: '0 20px 60px rgba(23, 32, 51, 0.12)'
      }
    }
  },
  plugins: []
};

export default config;
