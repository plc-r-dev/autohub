import { createTheme } from "@mui/material/styles"

/** Service Store portal theme — used for store selection / empty workspace. */
export const storeTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#16A34A",
      dark: "#15803D",
      light: "#4ADE80",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#0F172A",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F4F6F8",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },
    divider: "rgba(15, 23, 42, 0.08)",
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: [
      "var(--font-admin-sans)",
      "Noto Sans Thai",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12, fontWeight: 600 },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: "1px solid rgba(15, 23, 42, 0.08)",
          borderRadius: 20,
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        },
      },
    },
  },
})
