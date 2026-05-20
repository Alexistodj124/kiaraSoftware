// src/pages/NotFound.jsx
import * as React from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded'
import { alpha } from '@mui/material/styles'

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Paper
        sx={{
          p: { xs: 3, sm: 5 },
          textAlign: 'center',
          maxWidth: 480,
          width: '100%',
        }}
      >
        <Box
          sx={(theme) => ({
            width: 72,
            height: 72,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: 'primary.main',
            mx: 'auto',
            mb: 2,
          })}
        >
          <SearchOffRoundedIcon sx={{ fontSize: 36 }} />
        </Box>
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, mb: 1, letterSpacing: '-0.02em' }}
        >
          404
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Página no encontrada
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          La página que buscas no existe o fue movida.
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          startIcon={<HomeRoundedIcon />}
          size="large"
        >
          Volver al inicio
        </Button>
      </Paper>
    </Box>
  )
}
