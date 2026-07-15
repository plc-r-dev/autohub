"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { DetailModalTabs } from "@/components/service-store/modals/detail-modal-parts"
import { useStoreSettingsDirty } from "@/components/store-settings/store-unsaved-changes"

export type StoreSettingsTab = "general" | "services" | "hours" | "staff"

const TABS: Array<{ value: StoreSettingsTab; label: string }> = [
  { value: "general", label: "General" },
  { value: "services", label: "Services" },
  { value: "hours", label: "Opening Hours" },
  { value: "staff", label: "Staff" },
]

type StoreSettingsTabsProps = {
  activeTab: StoreSettingsTab
}

export function StoreSettingsTabs({ activeTab }: StoreSettingsTabsProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isDirty } = useStoreSettingsDirty()

  function handleChange(tab: string) {
    if (
      tab !== activeTab &&
      isDirty &&
      !window.confirm("You have unsaved changes. Leave without saving?")
    ) {
      return
    }

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
