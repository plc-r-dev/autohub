import Link from "next/link"
import type { ReactNode } from "react"

export function ManagementRowLink({
  href,
  children,
  "aria-label": ariaLabel,
}: {
  href: string
  children: ReactNode
  "aria-label"?: string
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="inline-flex items-center justify-center rounded-lg p-1.5 font-medium text-[#0F172A] hover:bg-muted hover:text-[#16A34A]"
    >
      {children}
    </Link>
  )
}
