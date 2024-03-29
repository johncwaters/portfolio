module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["[data-theme=dark]"],
          "base-100": "#002438",
          "base-content": "white",
          "neutral-content": "white",
          primary: "#B30003",
          accent: "#E50004",
        },
      },
    ],
  },
};
