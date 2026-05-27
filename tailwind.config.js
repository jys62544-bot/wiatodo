/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Segoe UI", "Microsoft YaHei", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
