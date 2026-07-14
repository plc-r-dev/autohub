import { StoreThemeProvider } from "@/components/service-store/theme/store-theme-provider"

type StoreMuiShellProps = {
  children: React.ReactNode
}

/** Store MUI theme — Emotion cache lives in the root layout. */
export function StoreMuiShell({ children }: StoreMuiShellProps) {
  return <StoreThemeProvider>{children}</StoreThemeProvider>
}
