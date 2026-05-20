import * as React from 'react'
import { Card, CardActionArea, Box, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { alpha } from '@mui/material/styles'

export default function ModuleCard({ to, title, icon: Icon, subtitle }) {
  return (
    <Card
      sx={{
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={to}
        sx={{ height: '100%' }}
      >
        <Box
          sx={{
            height: { xs: 150, sm: 170, md: 190, lg: 210 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            p: { xs: 2, md: 3 },
            position: 'relative',
            background: (theme) =>
              `linear-gradient(160deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          }}
        >
          {Icon && (
            <Box
              sx={(theme) => ({
                width: 64,
                height: 64,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
                transition: 'transform 240ms ease, background-color 240ms ease',
                '.MuiCardActionArea-root:hover &': {
                  transform: 'scale(1.08)',
                  backgroundColor: alpha(theme.palette.secondary.main, 0.18),
                },
              })}
            >
              <Icon sx={{ fontSize: 32 }} />
            </Box>
          )}

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  )
}
