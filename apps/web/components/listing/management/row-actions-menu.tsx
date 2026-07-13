"use client"

import Link from "next/link"
import { MoreVertical } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

export type ManagementRowAction = {
  key: string
  label: string
  href?: string
  onSelect?: () => void
  destructive?: boolean
}

type ManagementRowActionsMenuProps = {
  actions: ManagementRowAction[]
  ariaLabel?: string
}

export function ManagementRowActionsMenu({
  actions,
  ariaLabel = "Row actions",
}: ManagementRowActionsMenuProps) {
  if (actions.length === 0) {
    return <span className="text-xs text-[#8a97a5]">—</span>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-muted-foreground"
            aria-label={ariaLabel}
          >
            <MoreVertical className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.key}
            variant={action.destructive ? "destructive" : "default"}
            onClick={action.onSelect}
            render={
              action.href ? (
                <Link href={action.href}>{action.label}</Link>
              ) : (
                <span>{action.label}</span>
              )
            }
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
