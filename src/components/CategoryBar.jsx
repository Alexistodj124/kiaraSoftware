import * as React from 'react'
import { Box, Stack } from '@mui/material'
import CategoryTile from './CategoryTile'

// Puedes pasar icons desde @mui/icons-material por props si quieres
export default function CategoryBar({ categories, selected, onSelect }) {
  return (
    <Box
      sx={{
        position: 'relative',
        mb: 2,
        '&::after, &::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 8,
          width: 32,
          pointerEvents: 'none',
          zIndex: 1,
        },
        '&::before': {
          left: 0,
          background: (theme) =>
            `linear-gradient(to right, ${theme.palette.background.default}, transparent)`,
        },
        '&::after': {
          right: 0,
          background: (theme) =>
            `linear-gradient(to left, ${theme.palette.background.default}, transparent)`,
        },
      }}
    >
      <Box
        sx={{
          overflowX: 'auto',
          pb: 1,
          // ocultar la scrollbar pero permitir scroll
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { height: 6 },
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ minWidth: 'min-content', px: 0.5 }}>
          {categories.map((c) => (
            <CategoryTile
              key={c.id}
              label={c.label}
              icon={c.icon}
              selected={selected === c.id}
              onClick={() => onSelect(c.id)}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
