// src/ui/AppLayout.jsx
import * as React from 'react'
import { Outlet, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import MenuIcon from '@mui/icons-material/Menu'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits'
import AreaChartIcon from '@mui/icons-material/AreaChart'
import PortraitIcon from '@mui/icons-material/Portrait'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { alpha } from '@mui/material/styles'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: HomeRoundedIcon },
  { to: '/ventas', label: 'Ventas', icon: PointOfSaleIcon },
  { to: '/compras', label: 'Compras', icon: ProductionQuantityLimitsIcon },
  { to: '/reportes', label: 'Reportes', icon: AreaChartIcon },
  { to: '/clientes', label: 'Clientes', icon: PortraitIcon },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const handleLogout = () => {
    logout()                               // limpia contexto + localStorage
    navigate('/signin', { replace: true }) // manda al login
  }

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  const closeDrawer = () => setDrawerOpen(false)

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 1 }}>
          {/* Hamburguesa: solo móvil */}
          {user && (
            <IconButton
              edge="start"
              aria-label="abrir menú"
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 0.5 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Marca */}
          <Box
            component={RouterLink}
            to={user ? '/' : '/signin'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: 1,
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 34,
                height: 34,
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: '0.02em',
              }}
            >
              K
            </Avatar>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.04em',
                fontSize: { xs: '1.1rem', md: '1.2rem' },
              }}
            >
              Kiara
            </Typography>
          </Box>

          {/* Navegación desktop */}
          {user && (
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.to)
                return (
                  <Button
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    color="inherit"
                    sx={(theme) => ({
                      px: 1.75,
                      py: 0.75,
                      fontWeight: active ? 600 : 500,
                      color: active ? 'primary.main' : 'text.primary',
                      backgroundColor: active
                        ? alpha(theme.palette.primary.main, 0.08)
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.06),
                      },
                    })}
                  >
                    {item.label}
                  </Button>
                )
              })}

              <Divider orientation="vertical" flexItem sx={{ mx: 1.5, my: 1.5 }} />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  pl: 0.5,
                }}
              >
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    fontSize: 13,
                    bgcolor: 'secondary.main',
                  }}
                >
                  {(user.username || '?').slice(0, 1).toUpperCase()}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user.username}
                </Typography>
                <Button
                  onClick={handleLogout}
                  startIcon={<LogoutRoundedIcon />}
                  size="small"
                  sx={{ ml: 0.5, color: 'text.secondary' }}
                >
                  Salir
                </Button>
              </Box>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer móvil */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: 'background.paper',
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
          },
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 38,
              height: 38,
              fontWeight: 700,
            }}
          >
            K
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>Kiara</Typography>
            {user && (
              <Typography variant="caption" color="text.secondary">
                {user.username}
              </Typography>
            )}
          </Box>
        </Box>
        <Divider />
        <List sx={{ flex: 1, py: 1 }}>
          {user &&
            NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.to)
              return (
                <ListItem key={item.to} disablePadding sx={{ px: 1 }}>
                  <ListItemButton
                    component={RouterLink}
                    to={item.to}
                    onClick={closeDrawer}
                    selected={active}
                    sx={(theme) => ({
                      borderRadius: 10,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                          color: 'primary.main',
                        },
                      },
                    })}
                  >
                    <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontWeight: active ? 600 : 500 }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
        </List>
        {user && (
          <>
            <Divider />
            <Box sx={{ p: 1.5 }}>
              <Button
                fullWidth
                onClick={() => {
                  closeDrawer()
                  handleLogout()
                }}
                startIcon={<LogoutRoundedIcon />}
                sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
              >
                Cerrar sesión
              </Button>
            </Box>
          </>
        )}
      </Drawer>

      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 2, md: 3 },
          px: { xs: 2, sm: 3 },
          flex: 1,
        }}
      >
        <Outlet />
      </Container>
    </Box>
  )
}
