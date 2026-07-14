"use client"

import type { ReactNode } from "react"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import { storeTheme } from "@/components/service-store/theme/store-theme"

type StoreThemeProviderProps = {
  children: ReactNode
}

/** Theme only — Emotion cache comes from the Server selection shell. */
export function StoreThemeProvider({ children }: StoreThemeProviderProps) {
  return (
    <ThemeProvider theme={storeTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
