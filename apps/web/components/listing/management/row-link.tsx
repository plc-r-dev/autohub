import Link from "next/link"
import type { ReactNode } from "react"

export function ManagementRowLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className="font-medium text-[#0F172A] hover:text-[#16A34A]"
    >
      {children}
    </Link>
  )
}
