// src/ui/AppLayout.jsx
import * as React from 'react'
import { Outlet, Link as RouterLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

export default function AppLayout() {
  return (
    <>
      <AppBar
        position="static"
        sx={{ backgroundColor: '#e0dacb', color: 'black' }}
      >

        <Toolbar>
          <Typography sx={{ flexGrow: 1 }} variant="h6">Kiara</Typography>
          <Button color="inherit" component={RouterLink} to="/">Inicio</Button>
          <Button color="inherit" component={RouterLink} to="/Ventas">Ventas</Button>
          <Button color="inherit" component={RouterLink} to="/Compras">Compras</Button>
          <Button color="inherit" component={RouterLink} to="/Reportes">Reportes</Button>
          <Button color="inherit" component={RouterLink} to="/Clientes">Clientes</Button>
          <Button color="inherit" component={RouterLink} to="/signin">Sign in</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </>
  )
}
