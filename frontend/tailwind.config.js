import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        // ==========================================
        // BRAND
        // ==========================================

        primary: {
          DEFAULT: "#36D79D",
          foreground: "#0F241C",
        },

        // ==========================================
        // LIGHT THEME
        // ==========================================

        light: {
          background: "#F4F8F6",

          surface: {
            DEFAULT: "#FAFFFD",
            secondary: "#EEF3F0",
            tertiary: "#E8EEEC",
          },

          foreground: "#1B211E",

          muted: "#6D7A74",

          border: "#DEE4E1",

          success: "#29D163",

          warning: "#E59500",

          danger: "#F8465B",
        },

        // ==========================================
        // DARK THEME
        // ==========================================

        dark: {
          background: "#121614",

          surface: {
            DEFAULT: "#1B221E",
            secondary: "#242C28",
            tertiary: "#27302C",
          },

          foreground: "#FBFDFC",

          muted: "#96A49E",

          border: "#2A322E",

          success: "#29D163",

          warning: "#F0AF23",

          danger: "#E33B4E",
        },
      },

      fontFamily: {
        sans: ["Fredoka", "ui-sans-serif", "system-ui", "sans-serif"],
        fredoka: ["Fredoka", "ui-sans-serif", "system-ui", "sans-serif"],
      },

      borderRadius: {
        sm: "8px",
        DEFAULT: "16px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        field: "1rem", // 16px field radius
        btn: "9999px", // Pill / capsule button radius
        full: "9999px",
      },

      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.06)",

        "card-hover":
          "0 8px 24px rgba(0,0,0,0.10)",

        primary:
          "0 0 20px rgba(54,215,157,0.35)",

        glow:
          "0 4px 20px rgba(54,215,157,0.35)",

        modal:
          "0 20px 40px rgba(0,0,0,0.18)",
      },

      maxWidth: {
        container: "1280px",
      },

      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },

      scale: {
        103: "1.03",
        105: "1.05",
      },

      translate: {
        card: "-4px",
      },

      zIndex: {
        navbar: "50",
        sidebar: "40",
        dropdown: "60",
        modal: "70",
        toast: "80",
      },

      backdropBlur: {
        xs: "2px",
      },

      transitionDuration: {
        DEFAULT: "300ms",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },

  plugins: [
    plugin(function ({ addBase, addUtilities }) {
      addBase({
        'body, h1, h2, h3, h4, h5, h6, input, select, textarea, button': {
          fontFamily: 'Fredoka, ui-sans-serif, system-ui, sans-serif',
        },
      });

      addUtilities({
        '.custom-scrollbar': {
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            borderRadius: '9999px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(54, 215, 157, 0.4)',
            borderRadius: '9999px',
            '&:hover': {
              backgroundColor: 'rgba(54, 215, 157, 0.6)',
            },
          },
        },
      });
    }),
  ],
};