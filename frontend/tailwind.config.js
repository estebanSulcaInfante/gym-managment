/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // High contrast Light Mode base
        "background": "#f8fafc",
        "surface": "#ffffff",
        "surface-container": "#f1f5f9",
        "surface-container-low": "#f8fafc",
        "on-surface": "#0f172a",
        "on-surface-variant": "#475569",
        
        // Structural Blacks / Carbons
        "surface-dark": "#09090b", // zinc-950
        "on-surface-dark": "#ffffff",
        "on-surface-dark-variant": "#a1a1aa",

        // Yellow Action Colors
        "primary": "#facc15", // yellow-400
        "primary-container": "#eab308", // yellow-500
        "on-primary": "#000000",
        
        // Feedbacks
        "error": "#ef4444",
        "error-container": "#fee2e2",
        "on-error-container": "#991b1b",
        "success": "#10b981",
        "warning": "#f59e0b",

        // Borders
        "outline": "#cbd5e1",
        "outline-variant": "#e2e8f0"
      },
      fontFamily: {
        "headline": ["Lexend", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
        "label": ["Manrope", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem", 
        "xl": "0.5rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      backgroundImage: {
        'gym-pattern': "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%2364748b\\' fill-opacity=\\'0.03\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')",
      }
    },
  },
  plugins: [],
}
