/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        blueberry: "#7189FF",
        cerulean: "#758ECD",
        apple: "#96DE90",
        danger: "#FF5858",
        ink: "#1a1a1a",
        cream: "#FFFCF7",
      },
    },
  },
  plugins: [],
};
