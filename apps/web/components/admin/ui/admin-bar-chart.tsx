"use client"

import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"

/** Compact bar chart used by Admin KPI analytics. */
export function AdminBarChart({
  title,
  points,
  valueFormatter = (value) => String(value),
}: {
  title: string
  points: Array<{ label: string; value: number }>
  valueFormatter?: (value: number) => string
}) {
  const max = points.reduce((m, point) => Math.max(m, point.value), 0) || 1

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          {title}
        </Typography>
        {points.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No data.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {points.map((point) => (
              <Box
                key={point.label}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "5.5rem 1fr auto",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary" noWrap>
                  {point.label}
                </Typography>
                <Box
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    bgcolor: "action.hover",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${Math.max((point.value / max) * 100, 2)}%`,
                      bgcolor: "primary.main",
                      borderRadius: 999,
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {valueFormatter(point.value)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
