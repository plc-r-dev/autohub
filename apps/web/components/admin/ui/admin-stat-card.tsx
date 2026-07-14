"use client"

import * as React from "react"
import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import CardContent from "@mui/material/CardContent"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Link from "next/link"

type AdminStatCardProps = {
  label: string
  value: React.ReactNode
  description?: string
  href?: string
  actionLabel?: string
  tone?: "default" | "primary" | "warning" | "error" | "info"
}

const TONE_BG: Record<NonNullable<AdminStatCardProps["tone"]>, string> = {
  default: "transparent",
  primary: "rgba(22, 163, 74, 0.06)",
  warning: "rgba(217, 119, 6, 0.08)",
  error: "rgba(220, 38, 38, 0.06)",
  info: "rgba(2, 132, 199, 0.06)",
}

export function AdminStatCard({
  label,
  value,
  description,
  href,
  actionLabel,
  tone = "default",
}: AdminStatCardProps) {
  const content = (
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Stack spacing={1}>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h3" component="p" sx={{ fontSize: "1.75rem" }}>
          {value}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
        {actionLabel ? (
          <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>
            {actionLabel} →
          </Typography>
        ) : null}
      </Stack>
    </CardContent>
  )

  return (
    <Card sx={{ bgcolor: TONE_BG[tone], height: "100%" }}>
      {href ? (
        <CardActionArea
          component={Link}
          href={href}
          sx={{ height: "100%", alignItems: "stretch" }}
        >
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  )
}
