import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#edf9f7",
          100: "#d3f0eb",
          500: "#14967f",
          600: "#0f7a68",
          700: "#0d6255",
        },
        ink: {
          950: "#11211d",
        },
        sand: {
          50: "#f8f6ef",
          100: "#efe9da",
        },
      },
      boxShadow: {
        panel: "0 18px 48px rgba(17, 33, 29, 0.10)",
      },
      backgroundImage: {
        "paper-grid": "linear-gradient(rgba(20, 150, 127, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 150, 127, 0.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
