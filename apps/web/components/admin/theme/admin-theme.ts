import { createTheme } from "@mui/material/styles"

/**
 * Admin-only MUI theme. Do not use in Service Store or Customer portals.
 * cssVariables disabled — avoids SSR/client Paper shadow variable hydration mismatch.
 */
export const adminTheme = createTheme({
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
      dark: "#020617",
      light: "#334155",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#DC2626",
    },
    warning: {
      main: "#D97706",
    },
    info: {
      main: "#0284C7",
    },
    success: {
      main: "#16A34A",
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
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      "var(--font-admin-sans)",
      "Noto Sans Thai",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
    h1: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-0.015em" },
    h3: { fontSize: "1.125rem", fontWeight: 600 },
    h4: { fontSize: "1rem", fontWeight: 600 },
    h5: { fontSize: "0.9375rem", fontWeight: 600 },
    h6: { fontSize: "0.875rem", fontWeight: 600 },
    subtitle1: { fontSize: "0.9375rem", fontWeight: 500 },
    subtitle2: { fontSize: "0.8125rem", fontWeight: 500 },
    body1: { fontSize: "0.9375rem", lineHeight: 1.5 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.5 },
    button: { textTransform: "none", fontWeight: 600 },
    overline: {
      fontSize: "0.6875rem",
      fontWeight: 700,
      letterSpacing: "0.08em",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F4F6F8",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
        },
        sizeSmall: {
          paddingInline: 12,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: "1px solid rgba(15, 23, 42, 0.08)",
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        outlined: {
          borderColor: "rgba(15, 23, 42, 0.08)",
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        color: "inherit",
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "1px solid rgba(15, 23, 42, 0.08)",
          backgroundColor: "#FFFFFF",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          marginInline: 8,
          "&.Mui-selected": {
            backgroundColor: "rgba(22, 163, 74, 0.12)",
            color: "#15803D",
            "&:hover": {
              backgroundColor: "rgba(22, 163, 74, 0.16)",
            },
            "& .MuiListItemIcon-root": {
              color: "#16A34A",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 42,
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: "#64748B",
          backgroundColor: "#F8FAFC",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
        fullWidth: true,
      },
    },
  },
})
