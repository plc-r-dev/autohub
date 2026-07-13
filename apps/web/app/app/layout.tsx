import { Suspense } from "react"
import { ServiceStoreModalProvider } from "@/components/service-store/modals"

type ServiceStorePortalLayoutProps = {
  children: React.ReactNode
}

export default function ServiceStorePortalLayout({
  children,
}: ServiceStorePortalLayoutProps) {
  return (
    <Suspense fallback={children}>
      <ServiceStoreModalProvider>{children}</ServiceStoreModalProvider>
    </Suspense>
  )
}
