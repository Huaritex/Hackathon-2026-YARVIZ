/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,ts}"],
  theme: {
    extend: {
      colors: {
        "bg-main": "#09090b",
        "bg-card": "rgba(24,24,27,0.6)",
        "accent-indigo": "#6366f1",
        "accent-teal": "#14b8a6",
        "text-hero": "#ffffff",
        "text-muted": "#a1a1aa",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
