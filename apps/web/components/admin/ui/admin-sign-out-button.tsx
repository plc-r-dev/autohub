"use client"

import { useRouter } from "next/navigation"
import Button from "@mui/material/Button"
import { serviceStoreAuthClient } from "@/lib/auth-client"
import { PORTALS } from "@/lib/auth/portals"

export function AdminSignOutButton() {
  const router = useRouter()

  return (
    <Button
      variant="outlined"
      size="small"
      color="inherit"
      onClick={async () => {
        await serviceStoreAuthClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push(PORTALS.admin.home)
              router.refresh()
            },
          },
        })
      }}
    >
      Sign out
    </Button>
  )
}
