"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type StoreSettingsDirtyContextValue = {
  isDirty: boolean
  markDirty: () => void
  clearDirty: () => void
}

const StoreSettingsDirtyContext = createContext<StoreSettingsDirtyContextValue | null>(
  null,
)

export function StoreSettingsDirtyProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false)

  const markDirty = useCallback(() => {
    setIsDirty(true)
  }, [])

  const clearDirty = useCallback(() => {
    setIsDirty(false)
  }, [])

  const value = useMemo(
    () => ({ isDirty, markDirty, clearDirty }),
    [isDirty, markDirty, clearDirty],
  )

  return (
    <StoreSettingsDirtyContext.Provider value={value}>
      {children}
    </StoreSettingsDirtyContext.Provider>
  )
}

export function useStoreSettingsDirty() {
  const context = useContext(StoreSettingsDirtyContext)
  if (!context) {
    return {
      isDirty: false,
      markDirty: () => {},
      clearDirty: () => {},
    }
  }
  return context
}

export function useBeforeUnloadWhenDirty(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) {
      return
    }

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [isDirty])
}

export function StoreUnsavedChangesBanner({ visible }: { visible: boolean }) {
  if (!visible) {
    return null
  }

  return (
    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
      You have unsaved changes. Click <span className="font-semibold">Save changes</span> to
      keep them.
    </p>
  )
}
