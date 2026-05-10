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
          green: "#1DB954",
          "green-light": "#1ED760",
          black: "#121212",
          "dark-gray": "#181818",
          gray: "#282828",
          "light-gray": "#B3B3B3",
          white: "#FFFFFF",
          "card-hover": "#2a2a2a",
        },
      },
      fontFamily: {
        spotify: [
          "Circular",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
