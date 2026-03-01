/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        urbanist: ["Orbitron", "sans-serif"],
        orbitron: ["Orbitron", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    darkTheme: "baa-dark",
    themes: [
      {
        "baa-dark": {
          "primary": "#f7931a",
          "primary-content": "#0b0b0b",
          "secondary": "#181818",
          "secondary-content": "#f4efe8",
          "accent": "#ffb347",
          "accent-content": "#130f08",
          "neutral": "#0a0a0a",
          "neutral-content": "#f1ece5",
          "base-100": "#050505",
          "base-200": "#0b0b0b",
          "base-300": "#121212",
          "base-content": "#f5f2eb",
          "info": "#38bdf8",
          "info-content": "#071018",
          "success": "#34d399",
          "success-content": "#04100b",
          "warning": "#f59e0b",
          "warning-content": "#170c02",
          "error": "#f87171",
          "error-content": "#160607"
        }
      },
      {
        "baa-light": {
          "primary": "#101010",
          "primary-content": "#fff7ef",
          "secondary": "#e9dccd",
          "secondary-content": "#141414",
          "accent": "#f7931a",
          "accent-content": "#201406",
          "neutral": "#f8efe3",
          "neutral-content": "#101010",
          "base-100": "#fff9f2",
          "base-200": "#f7ead9",
          "base-300": "#efdec9",
          "base-content": "#111111",
          "info": "#2563eb",
          "info-content": "#eff6ff",
          "success": "#059669",
          "success-content": "#ecfdf5",
          "warning": "#b45309",
          "warning-content": "#fffbeb",
          "error": "#dc2626",
          "error-content": "#fef2f2"
        }
      }
    ]
  },
}
