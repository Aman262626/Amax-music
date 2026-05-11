import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#c026d3",
          "green-light": "#d946ef",
          black: "#0a0a0a",
          "dark-gray": "#121212",
          gray: "#1a1a2e",
          "light-gray": "#B3B3B3",
          white: "#FFFFFF",
          "card-hover": "#1e1e3a",
        },
        accent: {
          pink: "#ff6b9d",
          purple: "#c084fc",
          red: "#f43f5e",
          orange: "#fb923c",
          cyan: "#22d3ee",
          blue: "#60a5fa",
        },
      },
      fontFamily: {
        spotify: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
