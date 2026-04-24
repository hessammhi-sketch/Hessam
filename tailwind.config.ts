import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0e1412",
        surface: "#17211d",
        line: "#2b3a34",
        accent: "#b7ff6a",
        accentSoft: "#203221",
        text: "#f5f7f2",
        muted: "#9fada6",
        danger: "#ff7a7a"
      },
      fontFamily: {
        sans: ["var(--font-vazirmatn)", "var(--font-manrope)", "sans-serif"]
      },
      boxShadow: {
        panel: "0 20px 40px rgba(0, 0, 0, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
