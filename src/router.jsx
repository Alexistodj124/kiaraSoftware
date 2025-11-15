// src/router.jsx
import * as React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AppLayout from './ui/AppLayout.jsx'
import Home from './pages/Home.jsx'
import SignIn from './pages/SignIn.jsx'
import NotFound from './pages/NotFound.jsx'
import Ventas from './pages/Ventas.jsx'
import Compras from './pages/Compras.jsx'
import Reportes from './pages/Reportes.jsx'
import Clientes from './pages/Clientes.jsx'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },     // "/"
      { path: 'signin', element: <SignIn /> }, // "/sign-in"
      { path: '*', element: <NotFound /> },   // 404
      { path: 'ventas', element: <Ventas /> }, // "/ventas"
      { path: 'compras', element: <Compras /> }, // "/compras"
      { path: 'reportes', element: <Reportes /> }, // "/compras"
      { path: 'clientes', element: <Clientes /> }, // "/clientes"
    ],
  },
])

export default router
