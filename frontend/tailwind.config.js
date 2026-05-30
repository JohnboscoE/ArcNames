/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        arc: {
          bg:     "#000000",
          card:   "#0A0A0A",
          border: "#1A1A2E",
          blue:   "#0EA5E9",
          dblue:  "#0369A1",
          lblue:  "#38BDF8",
          muted:  "#334155",
          text:   "#94A3B8",
        }
      },
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}