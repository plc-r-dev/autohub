"use client"

import { Suspense, type ReactNode } from "react"
import { StoreSettingsDirtyProvider } from "@/components/store-settings/store-unsaved-changes"
import { StoreSettingsTabs, type StoreSettingsTab } from "@/components/store-settings/store-settings-tabs"

type StoreSettingsShellProps = {
  activeTab: StoreSettingsTab
  children: ReactNode
}

export function StoreSettingsShell({ activeTab, children }: StoreSettingsShellProps) {
  return (
    <StoreSettingsDirtyProvider>
      <div className="space-y-5">
        <Suspense fallback={null}>
          <StoreSettingsTabs activeTab={activeTab} />
        </Suspense>
        {children}
      </div>
    </StoreSettingsDirtyProvider>
  )
}
