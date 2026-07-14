"use client"

import Chip from "@mui/material/Chip"

function chipColor(
  status?: string,
): "default" | "success" | "error" | "warning" | "info" | "primary" {
  switch (status) {
    case "PAID":
    case "APPROVED":
    case "ACTIVE":
    case "SUCCESS":
    case "COMPLETED":
      return "success"
    case "REJECTED":
    case "PAYMENT_REJECTED":
    case "CANCELLED":
    case "FAILED":
    case "SUSPENDED":
      return "error"
    case "PAYMENT_SUBMITTED":
    case "PENDING":
    case "SUBMITTED":
    case "RUNNING":
      return "warning"
    case "DRAFT":
    case "SKIPPED":
      return "default"
    default:
      return "info"
  }
}

type AdminStatusChipProps = {
  label: string
  status?: string
}

export function AdminStatusChip({ label, status }: AdminStatusChipProps) {
  return (
    <Chip
      size="small"
      label={label}
      color={chipColor(status)}
      variant="outlined"
    />
  )
}
