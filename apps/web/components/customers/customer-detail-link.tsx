"use client"

import { useServiceStoreModals } from "@/components/service-store/modals"

type CustomerDetailLinkProps = {
  customerId: string
  children: React.ReactNode
  className?: string
}

export function CustomerDetailLink({
  customerId,
  children,
  className,
}: CustomerDetailLinkProps) {
  const { openCustomer } = useServiceStoreModals()

  return (
    <button
      type="button"
      onClick={() => openCustomer(customerId)}
      className={className ?? "font-medium text-foreground hover:underline"}
    >
      {children}
    </button>
  )
}
