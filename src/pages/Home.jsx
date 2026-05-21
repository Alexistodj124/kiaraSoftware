import * as React from 'react'
import { Grid, Typography, Box } from '@mui/material'
import AreaChartIcon from '@mui/icons-material/AreaChart'
import ModuleCard from '../components/ModuleCard'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits'
import PortraitIcon from '@mui/icons-material/Portrait'
import { useAuth } from '../context/AuthContext'

const modules = [
  { to: '/reportes', title: 'Reportes', icon: AreaChartIcon, subtitle: 'Reportes de Ventas' },
  { to: '/ventas',   title: 'Ventas',    icon: PointOfSaleIcon,      subtitle: 'Modulo de Ventas' },
  { to: '/compras',  title: 'Compras',  icon: ProductionQuantityLimitsIcon,       subtitle: 'Compra de productos' },
  { to: '/clientes',   title: 'Clientes',   icon: PortraitIcon,  subtitle: 'Compras por cliente' },
  // agrega más objetos para más cuadros
]

export default function Home() {
  const { user } = useAuth() || {}
  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: '0.12em', fontWeight: 600 }}
        >
          Bienvenida{user?.username ? `, ${user.username}` : ''}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mt: 0.5,
            fontSize: { xs: '1.6rem', sm: '1.9rem', md: '2.1rem' },
          }}
        >
          Módulos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Elige el módulo en el que quieres trabajar.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, md: 2.5 }} alignItems="stretch">
        {modules.map((m) => (
          <Grid
            key={m.to}
            size={{ xs: 12, sm: 6, md: 6, lg: 3 }}
            sx={{ display: 'flex', minWidth: 0 }}
          >
            <ModuleCard {...m} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
