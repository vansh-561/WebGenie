/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#171717",
        light: "#f2f4f4",
        primary: "#31c48d",
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
};