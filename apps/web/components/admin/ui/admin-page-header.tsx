"use client"

import * as React from "react"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

type AdminPageHeaderProps = {
  title?: string
  description?: string
  actions?: React.ReactNode
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  if (!title && !actions) return null

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{ alignItems: { sm: "flex-start" }, justifyContent: "space-between" }}
    >
      <Box sx={{ minWidth: 0 }}>
        {title ? (
          <Typography variant="h4" component="h2">
            {title}
          </Typography>
        ) : null}
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {actions ? (
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: "wrap" }}
          useFlexGap
        >
          {actions}
        </Stack>
      ) : null}
    </Stack>
  )
}
