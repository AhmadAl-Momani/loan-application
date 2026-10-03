/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colours from the brief
        primary: '#1F4E79',
        accent: '#27AE60',
        error: '#E74C3C',
        warning: '#F39C12',
        // Darker text-safe variants: brand green/red fail 4.5:1 on white
        'accent-dark': '#1E8449',
        'error-dark': '#C0392B',
        'warning-dark': '#8A5A00',
      },
    },
  },
  plugins: [],
};
