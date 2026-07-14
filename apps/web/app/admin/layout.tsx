import { Noto_Sans_Thai } from "next/font/google"
import { AdminThemeProvider } from "@/components/admin/theme/admin-theme-provider"

const adminSans = Noto_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin-sans",
  display: "swap",
})

type AdminPortalLayoutProps = {
  children: React.ReactNode
}

/** Admin portal: MUI theme scoped here — Service Store untouched. */
export default function AdminPortalLayout({ children }: AdminPortalLayoutProps) {
  return (
    <div className={`${adminSans.variable} ${adminSans.className}`}>
      <AdminThemeProvider>{children}</AdminThemeProvider>
    </div>
  )
}
