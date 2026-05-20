import * as React from 'react'
import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'

export default function CategoryTile({ label, selected, onClick, icon: Icon }) {
  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      sx={(theme) => ({
        cursor: 'pointer',
        flex: '0 0 auto',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        height: 38,
        px: 2,
        borderRadius: 999,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        bgcolor: selected ? 'primary.main' : 'background.paper',
        color: selected ? 'primary.contrastText' : 'text.primary',
        border: `1px solid ${
          selected ? 'transparent' : alpha(theme.palette.primary.main, 0.18)
        }`,
        boxShadow: selected
          ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.28)}`
          : 'none',
        transition:
          'transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease, color 160ms ease, border-color 160ms ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          bgcolor: selected
            ? 'primary.main'
            : alpha(theme.palette.primary.main, 0.06),
          borderColor: selected
            ? 'transparent'
            : alpha(theme.palette.primary.main, 0.36),
          boxShadow: selected
            ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.32)}`
            : `0 2px 6px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      })}
    >
      {Icon && <Icon sx={{ fontSize: 18 }} />}
      <Typography
        component="span"
        sx={{
          fontWeight: selected ? 600 : 500,
          fontSize: '0.8125rem',
          lineHeight: 1,
          letterSpacing: '0.005em',
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}
