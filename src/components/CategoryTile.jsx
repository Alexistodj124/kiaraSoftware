import * as React from 'react'
import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'

export default function CategoryTile({ label, selected, onClick, icon: Icon }) {
  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      sx={(theme) => ({
        cursor: 'pointer',
        width: { xs: 76, sm: 84 },
        flex: '0 0 auto',
        aspectRatio: '1 / 1',
        borderRadius: 14 / 8,
        display: 'grid',
        placeItems: 'center',
        px: 1,
        bgcolor: selected ? 'primary.main' : 'background.paper',
        color: selected ? 'primary.contrastText' : 'text.primary',
        border: `1px solid ${selected ? 'transparent' : theme.palette.divider}`,
        boxShadow: selected
          ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`
          : '0 1px 2px rgba(0,0,0,0.03)',
        transition:
          'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, color 180ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: selected
            ? `0 10px 22px ${alpha(theme.palette.primary.main, 0.34)}`
            : '0 6px 16px rgba(0,0,0,0.08)',
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      })}
    >
      <Box sx={{ textAlign: 'center', lineHeight: 1 }}>
        {Icon && <Icon sx={{ fontSize: 26, mb: 0.5 }} />}
        <Typography
          variant="caption"
          noWrap
          sx={{ fontWeight: selected ? 600 : 500, fontSize: '0.75rem' }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  )
}
