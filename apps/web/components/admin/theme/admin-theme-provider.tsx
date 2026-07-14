"use client"

import type { ReactNode } from "react"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import { adminTheme } from "@/components/admin/theme/admin-theme"

type AdminThemeProviderProps = {
  children: ReactNode
}

/** Admin ThemeProvider only — Emotion cache is provided by the Server layout. */
export function AdminThemeProvider({ children }: AdminThemeProviderProps) {
  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
