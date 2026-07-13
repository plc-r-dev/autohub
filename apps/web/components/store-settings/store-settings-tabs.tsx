"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { DetailModalTabs } from "@/components/service-store/modals/detail-modal-parts"

export type StoreSettingsTab = "general" | "services" | "hours"

const TABS: Array<{ value: StoreSettingsTab; label: string }> = [
  { value: "general", label: "General" },
  { value: "services", label: "Services" },
  { value: "hours", label: "Opening Hours" },
]

type StoreSettingsTabsProps = {
  activeTab: StoreSettingsTab
}

export function StoreSettingsTabs({ activeTab }: StoreSettingsTabsProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(tab: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    params.delete("page")
    params.delete("pageSize")
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <DetailModalTabs
      tabs={TABS}
      value={activeTab}
      onChange={handleChange}
    />
  )
}
