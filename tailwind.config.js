/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      "colors": {
        "background": "#0a0e1a",
        "surface": "#111827",
        "surface-dim": "#060a12",
        "surface-bright": "#1a2332",
        "surface-variant": "#1a2332",
        "surface-container": "#131b2b",
        "surface-container-low": "#111827",
        "surface-container-lowest": "#060a12",
        "surface-container-high": "#1a2332",
        "surface-container-highest": "#1f2937",
        "surface-tint": "#ffffff",

        "primary": "#ffffff",
        "primary-container": "#ffffff",
        "on-primary": "#111827",
        "on-primary-container": "#111827",
        "inverse-primary": "#6366f1",

        "secondary": "#4edea3",
        "secondary-container": "#00a572",
        "on-secondary": "#003824",
        "on-secondary-container": "#00311f",

        "tertiary": "#8b9dc3",
        "tertiary-container": "#8ab0ff",
        "on-tertiary": "#002e6a",
        "on-tertiary-container": "#00408f",

        "error": "#ef4444",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",

        "on-surface": "#f1f5f9",
        "on-surface-variant": "#94a3b8",
        "on-background": "#e2e8f0",

        "inverse-surface": "#e2e8f0",
        "inverse-on-surface": "#1f2937",

        "outline": "#475569",
        "outline-variant": "#1e293b",

        "primary-fixed": "#ffffff",
        "primary-fixed-dim": "#e2e8f0",
        "on-primary-fixed": "#111827",
        "on-primary-fixed-variant": "#1e293b",
        "secondary-fixed": "#6ffbbe",
        "secondary-fixed-dim": "#4edea3",
        "on-secondary-fixed": "#002113",
        "on-secondary-fixed-variant": "#005236",
        "tertiary-fixed": "#d8e2ff",
        "tertiary-fixed-dim": "#adc6ff",
        "on-tertiary-fixed": "#001a42",
        "on-tertiary-fixed-variant": "#004395"
      },
      "borderRadius": {
        "DEFAULT": "0.5rem",
        "md": "0.75rem",
        "lg": "1rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "full": "9999px"
      },
      "spacing": {
        "stack-md": "24px",
        "container-max": "1440px",
        "stack-lg": "48px",
        "base": "8px",
        "stack-sm": "12px",
        "gutter": "24px",
        "margin-desktop": "32px",
        "margin-mobile": "16px",
        "container-gap": "20px",
        "sidebar-width": "280px"
      },
      "fontFamily": {
        "display": ["Inter", "sans-serif"],
        "headline": ["Inter", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"],
        "currency-nominal-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "headline-display": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "data-mono": ["Inter", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"]
      },
      "fontSize": {
        "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "label-md": ["14px", {"lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "500"}],
        "label-sm": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
        "currency-nominal-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "headline-display": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.03em", "fontWeight": "800"}],
        "data-mono": ["14px", {"lineHeight": "20px", "fontWeight": "500"}],
        "label-caps": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "700"}]
      }
    }
  },
  plugins: [],
}
