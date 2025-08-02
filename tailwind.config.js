/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // <- this is crucial
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
}
