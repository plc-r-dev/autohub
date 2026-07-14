"use client"

import * as React from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

type AdminSectionCardProps = {
  title?: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function AdminSectionCard({
  title,
  description,
  action,
  children,
}: AdminSectionCardProps) {
  return (
    <Card>
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          "&:last-child": { pb: { xs: 2, sm: 2.5 } },
        }}
      >
        {(title || action) && (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "flex-start",
              justifyContent: "space-between",
              mb: title || description ? 2 : 0,
            }}
          >
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              {title ? (
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {title}
                </Typography>
              ) : null}
              {description ? (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              ) : null}
            </Stack>
            {action}
          </Stack>
        )}
        {children}
      </CardContent>
    </Card>
  )
}
