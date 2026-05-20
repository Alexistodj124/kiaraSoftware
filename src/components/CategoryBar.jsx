import * as React from 'react'
import { Box, Tabs, Tab } from '@mui/material'
import { alpha } from '@mui/material/styles'

export default function CategoryBar({ categories, selected, onSelect }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Tabs
        value={selected}
        onChange={(_, newValue) => onSelect(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={(theme) => ({
          minHeight: 44,
          borderBottom: `1px solid ${theme.palette.divider}`,
          '& .MuiTabs-flexContainer': {
            gap: 0.5,
          },
          '& .MuiTabs-scrollButtons': {
            color: theme.palette.text.secondary,
            '&.Mui-disabled': {
              opacity: 0.3,
            },
          },
          '& .MuiTab-root': {
            minHeight: 44,
            minWidth: 'auto',
            px: 2,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            letterSpacing: '0.01em',
            color: theme.palette.text.secondary,
            transition: 'color 160ms ease, background-color 160ms ease',
            borderRadius: '8px 8px 0 0',
            '&:hover': {
              color: theme.palette.text.primary,
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
            '&.Mui-selected': {
              fontWeight: 600,
              color: theme.palette.primary.main,
            },
            '&.Mui-focusVisible': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            backgroundColor: theme.palette.primary.main,
          },
        })}
      >
        {categories.map((c) => {
          const Icon = c.icon
          return (
            <Tab
              key={c.id}
              value={c.id}
              label={c.label}
              icon={Icon ? <Icon sx={{ fontSize: 18 }} /> : undefined}
              iconPosition="start"
              disableRipple={false}
            />
          )
        })}
      </Tabs>
    </Box>
  )
}
