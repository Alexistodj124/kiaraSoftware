// src/pages/SignIn.jsx
import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar, Button, CssBaseline, TextField, Box,
  Typography, Container, Paper, Alert, InputAdornment, IconButton
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import { alpha } from '@mui/material/styles'
import { useAuth } from '../context/AuthContext'

export default function SignIn() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const username = data.get('user')
    const password = data.get('password')

    try {
      setError('')
      const user = await login(username, password)
      // si quieres, puedes mandar a ventas o a home:
      navigate('/ventas', { replace: true })
    } catch (err) {
      console.error(err)
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        background: (theme) =>
          `radial-gradient(1200px 600px at 50% -10%, ${alpha(theme.palette.secondary.main, 0.18)}, transparent 60%), ${theme.palette.background.default}`,
      }}
    >
      <CssBaseline />
      <Container component="main" maxWidth="xs" sx={{ width: '100%' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            backgroundColor: 'background.paper',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow:
              '0 4px 14px rgba(0,0,0,0.04), 0 24px 48px rgba(0,0,0,0.08)',
          }}
        >
          <Box
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <Avatar
              sx={{
                m: 1,
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
                fontWeight: 700,
                fontSize: 22,
              }}
            >
              K
            </Avatar>
            <Typography
              component="h1"
              variant="h4"
              sx={{ fontWeight: 700, letterSpacing: '0.02em', mt: 1 }}
            >
              Kiara
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Inicia sesión para continuar
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 2, width: '100%' }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="user"
                label="Usuario"
                name="user"
                autoComplete="user"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineRoundedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="mostrar contraseña"
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOffRoundedIcon fontSize="small" />
                        ) : (
                          <VisibilityRoundedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 1, py: 1.25, fontSize: '1rem' }}
              >
                Iniciar Sesión
              </Button>
            </Box>
          </Box>
        </Paper>

        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          sx={{ display: 'block', mt: 3 }}
        >
          © {new Date().getFullYear()} Kiara · Sistema de Punto de Venta
        </Typography>
      </Container>
    </Box>
  )
}
