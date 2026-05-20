// src/pages/Inventory.jsx
import * as React from 'react'
import {
  Box, Grid, Typography, Divider, List, ListItem, ListItemText,
  IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, Snackbar, Alert, MenuItem, Autocomplete, Paper, Chip
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import { alpha } from '@mui/material/styles'
import CategoryBar from '../components/CategoryBar'
import ProductCard from '../components/ProductCard'
import { API_BASE_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'


const CATEGORIES = [
  { id: 'all', label: 'Todo' },
  { id: 'autos', label: 'Cabello' },
  { id: 'motos', label: 'Uñas' },
  { id: 'quimicos', label: 'Pedicure' },
  { id: 'accesorios', label: 'Manicure' },
]

const PRODUCTS = [
  { id: 1, name: 'Shampoo pH Neutro 1L', sku: 'SH-001', price: 89.90, stock: 12, cat: 'quimicos', image: '' },
  { id: 2, name: 'Guante Microfibra Premium', sku: 'GM-010', price: 59.50, stock: 3,  cat: 'accesorios', image: '' },
  { id: 3, name: 'Cera Sintética 500ml', sku: 'CE-500', price: 129.00, stock: 7, cat: 'quimicos', image: '' },
  { id: 4, name: 'Toalla Secado 1200gsm', sku: 'TS-1200', price: 99.00, stock: 20, cat: 'accesorios', image: '' },
  { id: 5, name: 'Cepillo Llantas', sku: 'CL-020', price: 45.00, stock: 2, cat: 'accesorios', image: '' },
  { id: 6, name: 'Ambientador New Car', sku: 'AN-001', price: 25.00, stock: 14, cat: 'accesorios', image: '' },
]

const empleadas = [
  { id: 1, nombre: 'Ana' },
  { id: 2, nombre: 'María' },
  { id: 3, nombre: 'Lucía' },
]

const tipoPago = [
  { id: 1, nombre: 'Efectivo' },
  { id: 2, nombre: 'Tarjeta' },
  { id: 3, nombre: 'Transferencia' },
]

const tipoPOS = [
  { id: 'all', label: 'Todo' },
  { id: 'serv', label: 'Servicios' },
  { id: 'prod', label: 'Productos' },
]



export default function Inventory() {
  const { isAdmin } = useAuth() || {}
  const [tipoPOSset, setTipoPOS] = React.useState('all')
  const [category, setCategory] = React.useState('all')
  const [cart, setCart] = React.useState([])

  // Dialog de datos del cliente
  const [openDialog, setOpenDialog] = React.useState(false)
  const [venta, setVenta] = React.useState({ pago: '', referencia: '' })
  const [errors, setErrors] = React.useState({ nombre: '', telefono: '', pago: '', referencia: '' })

  const [categoriasProductos, setCategoriasProductos] = React.useState([])
  const [categoriasServicios, setCategoriasServicios] = React.useState([])
  const [marcasProductos, setMarcasProductos] = React.useState([])
  const [productos, setProductos] = React.useState([])
  const [servicios, setServicios] = React.useState([])
  const [empleadas, setEmpleadas] = React.useState([])
  const [empleadaDialogOpen, setEmpleadaDialogOpen] = React.useState(false)
  const [empleadaSeleccionadaId, setEmpleadaSeleccionadaId] = React.useState('')
  const [nuevaEmpleada, setNuevaEmpleada] = React.useState({ nombre: '', telefono: '' })
  const [mostrarNuevaEmpleada, setMostrarNuevaEmpleada] = React.useState(false)
  const [pendingItem, setPendingItem] = React.useState(null)
  const [descuentoPct, setDescuentoPct] = React.useState('0')
  const [marca, setMarca] = React.useState('all')

  const [clientes, setClientes] = React.useState([])          // lista desde el backend
  const [cliente, setCliente] = React.useState({ nombre: '', telefono: '' })
  const [esClienteExistente, setEsClienteExistente] = React.useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = React.useState(null)

  React.useEffect(() => {
    if (!isAdmin) {
      setDescuentoPct('0')
    }
  }, [isAdmin])


  const requiereReferencia =
    venta.pago === 'Tarjeta' || venta.pago === 'Transferencia'

  // Snackbar de confirmación
  const [snack, setSnack] = React.useState({ open: false, msg: '', severity: 'success' })

  // const filtered = React.useMemo(() => {
  //   if (categoriasProductos.id === 'all') return productos
  //   return productos.filter(p => p.categoria_id === categoriasProductos.id)
  // }, [categoriasProductos.id])
  const filtered = React.useMemo(() => {
    const productosAdaptados = productos.map(p => ({
      ...p,
      tipo: 'producto',
      esServicio: false,
    }))

    const categoriaServicioById = new Map(
      categoriasServicios
        .filter(c => c.id !== 'all')
        .map(c => [String(c.id), c.label])
    )

    const serviciosAdaptados = servicios.map(s => ({
      ...s,
      tipo: 'servicio',
      esServicio: true,
      // ProductCard espera `cantidad`, `precio`, `descripcion`, `imagen`
      cantidad: 9999,              // o 1, si no manejas stock de servicios
      descripcion: s.descripcion,
      precio: Number(s.precio),
      imagen: s.imagen,
      categoria_nombre: categoriaServicioById.get(String(s.categoria_id)) || 'Servicio',
    }))

    // Helper para filtrar por categoría
    const filtrarPorCategoria = (lista) => {
      if (category === 'all') return lista
      return lista.filter(item => String(item.categoria_id) === String(category))
    }
    const filtrarPorMarca = (lista) => {
      if (marca === 'all') return lista
      return lista.filter(item => {
        if (item.tipo !== 'producto') return true
        return String(item.marca_id) === String(marca)
      })
    }

    if (tipoPOSset === 'prod') {
      // Solo productos
      return filtrarPorMarca(filtrarPorCategoria(productosAdaptados))
    }

    if (tipoPOSset === 'serv') {
      // Solo servicios → los adaptamos al shape del ProductCard
      return filtrarPorCategoria(serviciosAdaptados)
    }

    // tipoPOSset === 'all' → mezclamos ambos
    const listaMixta = [
      ...productosAdaptados,
      ...serviciosAdaptados,
    ]

    // En "Todo" puedes ignorar category o filtrar igual:
    return filtrarPorMarca(filtrarPorCategoria(listaMixta))
  }, [tipoPOSset, category, marca, productos, servicios, categoriasServicios])



  const cargarCategoriasProductos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categorias-productos`)
      if (!res.ok) throw new Error('Error al obtener categorías de productos')
      const data = await res.json()
      // data = [{ id, nombre, descripcion, activo }, ...]

      const mapped = [
        { id: 'all', label: 'Todas' },
        ...data.map(cat => ({
          id: String(cat.id),        // lo pasamos a string por si acaso
          label: cat.nombre,
        })),
      ]

      setCategoriasProductos(mapped)
    } catch (err) {
      console.error(err)
    }
  }

  const cargarCategoriasServicios = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categorias-servicios`)
      if (!res.ok) throw new Error('Error al obtener categorías de servicios')
      const data = await res.json()

      const mapped = [
        { id: 'all', label: 'Todas' },
        ...data.map(cat => ({
          id: String(cat.id),
          label: cat.nombre,
        })),
      ]

      setCategoriasServicios(mapped)
    } catch (err) {
      console.error(err)
    }
  }

  const cargarMarcasProductos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/marcas-productos`)
      if (!res.ok) throw new Error('Error al obtener marcas de productos')
      const data = await res.json()

      const mapped = [
        { id: 'all', label: 'Todas' },
        ...data.map((m) => ({
          id: String(m.id),
          label: m.nombre,
        })),
      ]

      setMarcasProductos(mapped)
    } catch (err) {
      console.error(err)
    }
  }


  const cargarProductos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/productos`)
      if (!res.ok) throw new Error('Error al obtener productos')
      const data = await res.json()
      setProductos(data) // array de { id, nombre, descripcion, activo }
      console.log('Producto creado:', data)
    } catch (err) {
      console.error(err)
    }
  }
  const cargarServicios = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/servicios`)
      if (!res.ok) throw new Error('Error al obtener servicios')
      const data = await res.json()
      setServicios(data) // array de { id, nombre, descripcion, activo }
    } catch (err) {
      console.error(err)
    }
  }
  const cargarClientes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/clientes`)
      if (!res.ok) throw new Error('Error al obtener clientes')
      const data = await res.json()
      setClientes(data) // array de { id, nombre, descripcion, activo }
    } catch (err) {
      console.error(err)
    }
  }
  const cargarEmpleadas = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/empleadas`)
      if (!res.ok) throw new Error('Error al obtener empleadas')
      const data = await res.json()
      setEmpleadas(data) // array de { id, nombre, descripcion, activo }
    } catch (err) {
      console.error(err)
    }
  }

  const getItemKey = (item) => {
    const tipo = item.tipo || (item.esServicio ? 'servicio' : 'producto')
    const emp = item.empleada
    const empKey = emp?.id ? `emp-${emp.id}` : emp?.nombre ? `emp-${emp.nombre}` : 'emp-none'
    return `${tipo}-${item.id}-${empKey}`
  }

  const addToCartWithEmpleada = (prod, empleada) => {
    const prodConEmp = { ...prod, empleada }
    const key = getItemKey(prodConEmp)
    setCart(prev => {
      const existing = prev.find(p => p.lineKey === key)
      if (existing) {
        return prev.map(p => p.lineKey === key ? { ...p, qty: p.qty + 1 } : p)
      }
      return [...prev, { ...prodConEmp, qty: 1, lineKey: key }]
    })
  }

  const removeFromCart = (lineKey) => setCart(prev => prev.filter(p => p.lineKey !== lineKey))

  const subtotal = cart.reduce((sum, p) => sum + p.precio * p.qty, 0)
  const pctNumber = Math.min(100, Math.max(0, parseFloat(descuentoPct) || 0))
  const descuentoQ = subtotal * (pctNumber / 100)
  const totalConDescuento = Math.max(0, subtotal - descuentoQ)

  const handleProductClick = (prod) => {
    setPendingItem(prod)
    setEmpleadaDialogOpen(true)
  }

  const handleConfirmEmpleada = () => {
    if (!pendingItem) return

    let empleada = null
    if (mostrarNuevaEmpleada && nuevaEmpleada.nombre.trim()) {
      empleada = {
        id: null,
        nombre: nuevaEmpleada.nombre.trim(),
        telefono: nuevaEmpleada.telefono.trim(),
      }
    } else if (empleadaSeleccionadaId) {
      const emp = empleadas.find(e => String(e.id) === String(empleadaSeleccionadaId))
      if (emp) empleada = emp
    }

    addToCartWithEmpleada(pendingItem, empleada)
    setPendingItem(null)
    setEmpleadaSeleccionadaId('')
    setNuevaEmpleada({ nombre: '', telefono: '' })
    setMostrarNuevaEmpleada(false)
    setEmpleadaDialogOpen(false)
  }

  const handleCloseEmpleadaDialog = () => {
    setPendingItem(null)
    setEmpleadaSeleccionadaId('')
    setNuevaEmpleada({ nombre: '', telefono: '' })
    setMostrarNuevaEmpleada(false)
    setEmpleadaDialogOpen(false)
  }

  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      setSnack({ open: true, msg: 'Tu carrito está vacío', severity: 'warning' })
      return
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const validate = () => {
    let ok = true
    const e = { nombre: '', telefono: '', pago: '', referencia: '' }

    if (!cliente.nombre.trim()) {
      e.nombre = 'Ingresa el nombre'
      ok = false
    }
    const tel = cliente.telefono.trim()
    // Validación simple: 8–15 dígitos (permite + y espacios)
    const telOk = /^(\+?\d[\d\s-]{7,14})$/.test(tel)
    if (!telOk) {
      e.telefono = 'Ingresa un número válido (8–15 dígitos)'
      ok = false
    }

    if (!venta.pago) {
      e.pago = 'Selecciona un método de pago'
      ok = false
    }

    if (requiereReferencia && !venta.referencia.trim()) {
      e.referencia = 'Ingresa la referencia'
      ok = false
    }

    setErrors(e)
    return ok
  }

  const handleConfirmCheckout = async () => {
    if (!validate()) return
    if (cart.length === 0) {
      setSnack({ open: true, msg: 'Tu carrito está vacío', severity: 'warning' })
      return
    }

    // 1) Construir cliente en el formato que espera el back
    // Por ahora asumimos que no tienes cliente.id, solo nombre + telefono
    const clientePayload = {
      nombre: cliente.nombre,
      telefono: cliente.telefono,
    }

    // 3) Items: por ahora asumimos que TODO lo que vendes aquí son productos
    const itemsPayload = cart.map((item) => {
      if (item.cantidad === 9999) {
        return {
          tipo: 'servicio',
          servicio_id: item.id,
          cantidad: item.qty,
          precio_unitario: item.precio,
          empleada: item.empleada
            ? {
                id: item.empleada.id ?? null,
                nombre: item.empleada.nombre,
                telefono: item.empleada.telefono ?? '',
              }
            : null,
        }
      }

      return {
        tipo: 'producto',
        producto_id: item.id,
        cantidad: item.qty,
        precio_unitario: item.precio,
        empleada: item.empleada
          ? {
              id: item.empleada.id ?? null,
              nombre: item.empleada.nombre,
              telefono: item.empleada.telefono ?? '',
            }
          : null,
      }
    })

    // 4) Armar el body EXACTO para /ordenes
    const body = {
      codigo: `ORD-${Date.now()}`,        // puedes cambiarlo por tu lógica de código
      fecha: new Date().toISOString(),
      cliente: clientePayload,
      tipo_pago: venta.pago || null,
      referencia: venta.referencia?.trim() || null,
      items: itemsPayload,
      descuento: descuentoQ,
      total: totalConDescuento,
    }

    console.log('Payload para /ordenes:', body)

    try {
      const res = await fetch(`${API_BASE_URL}/ordenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('Error al crear orden:', errorText)
        setSnack({
          open: true,
          msg: 'Error al crear la orden ❌',
          severity: 'error',
        })
        return
      }

      const data = await res.json()
      console.log('Orden creada en backend:', data)

      // Feedback y clean-up SOLO si todo salió bien
      setSnack({
        open: true,
        msg: 'Pedido creado correctamente ✅',
        severity: 'success',
      })
      setOpenDialog(false)
      setCliente({ nombre: '', telefono: '' })
      setVenta({ pago: '', referencia: '' })
      setCart([])

    } catch (err) {
      console.error('Error de red al crear orden:', err)
      setSnack({
        open: true,
        msg: 'Error de conexión al crear la orden ❌',
        severity: 'error',
      })
    }
  }

  React.useEffect(() => {
      cargarCategoriasProductos()
      cargarCategoriasServicios()
      cargarMarcasProductos()
      cargarProductos()
      cargarServicios()
      cargarClientes()
      cargarEmpleadas()
    }, [])
  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      spacing={{ xs: 2, lg: 2.5 }}
      sx={{ alignItems: 'flex-start' }}
    >
      {/* -------- IZQUIERDA: INVENTARIO -------- */}
      <Box sx={{ flex: { xs: '1 1 100%', lg: 3 }, minWidth: 0, width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            mb: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.4rem', md: '1.6rem' },
            }}
          >
            Inventario
          </Typography>
          <Chip
            label={`${filtered.length} ${filtered.length === 1 ? 'ítem' : 'ítems'}`}
            size="small"
            variant="outlined"
          />
        </Box>

        <CategoryBar
          categories={tipoPOS}
          selected={tipoPOSset}
          onSelect={setTipoPOS}
        />
        {tipoPOSset == "prod" && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <TextField
              select
              label="Categoría"
              size="small"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 180 } }}
            >
              {categoriasProductos.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Marca"
              size="small"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 180 } }}
            >
              {marcasProductos.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        )}
        {tipoPOSset == "serv" && (
          <CategoryBar
            categories={categoriasServicios}
            selected={category}
            onSelect={setCategory}
          />
        )}
        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="stretch">
          {filtered.map(prod => (
            <Grid
              key={getItemKey(prod)}
              size={{ xs: 6, sm: 4, md: 3, lg: 3, xl: 2 }}
              sx={{ display: 'flex', minWidth: 0 }}
            >
              <ProductCard
                product={prod}
                onClick={() => handleProductClick(prod)}
              />
            </Grid>
          ))}
          {filtered.length === 0 && (
            <Grid size={12}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  border: (theme) => `1px dashed ${theme.palette.divider}`,
                  backgroundColor: 'transparent',
                }}
              >
                <Typography color="text.secondary">
                  No hay productos en esta categoría
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

      </Box>

      {/* -------- DERECHA: CARRITO -------- */}
      <Paper
        sx={{
          flex: { xs: '1 1 100%', lg: 1 },
          width: '100%',
          minWidth: { xs: 'auto', lg: 320 },
          p: { xs: 2, sm: 2.5 },
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          height: { xs: 'auto', lg: '82vh' },
          maxHeight: { xs: 'none', lg: '82vh' },
          position: { xs: 'static', lg: 'sticky' },
          top: { lg: 16 },
          alignSelf: { lg: 'flex-start' },
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1.5,
          }}
        >
          <Box
            sx={(theme) => ({
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            })}
          >
            <ShoppingCartRoundedIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Carrito
          </Typography>
          <Chip
            size="small"
            label={cart.reduce((s, it) => s + it.qty, 0)}
            sx={{
              ml: 'auto',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 600,
              height: 22,
            }}
          />
        </Box>
        <Divider sx={{ mb: 1 }} />

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            minHeight: { xs: 120, lg: 0 },
            mx: -1,
            px: 1,
          }}
        >
          <List dense disablePadding>
            {cart.map(item => (
              <ListItem
                key={item.lineKey}
                disablePadding
                sx={{
                  py: 1,
                  px: 1,
                  borderRadius: 10 / 8,
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                  },
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => removeFromCart(item.lineKey)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${item.descripcion}`}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                  secondary={
                    <>
                      Q {item.precio.toFixed(2)} × {item.qty}
                      {item.empleada?.nombre && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="secondary.main"
                          sx={{ display: 'block', fontWeight: 500 }}
                        >
                          {item.empleada.nombre}
                        </Typography>
                      )}
                    </>
                  }
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItem>
            ))}
          </List>

          {cart.length === 0 && (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: 'text.secondary',
              }}
            >
              <ShoppingCartRoundedIcon
                sx={{
                  fontSize: 40,
                  opacity: 0.3,
                  mb: 1,
                }}
              />
              <Typography variant="body2">
                No hay productos en el carrito
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ mt: 1, mb: 2 }} />

        <Box>
          {isAdmin && (
            <TextField
              label="Descuento (%)"
              type="number"
              value={descuentoPct}
              onChange={(e) => setDescuentoPct(e.target.value)}
              inputProps={{ min: 0, max: 100 }}
              size="small"
              fullWidth
              sx={{ mb: 1.5 }}
            />
          )}
          <Stack spacing={0.5} sx={{ mb: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">Subtotal</Typography>
              <Typography variant="body2">Q {subtotal.toFixed(2)}</Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">
                Descuento ({pctNumber.toFixed(0)}%)
              </Typography>
              <Typography variant="body2">− Q {descuentoQ.toFixed(2)}</Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                mt: 0.5,
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>Total</Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: 'primary.main' }}
              >
                Q {totalConDescuento.toFixed(2)}
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            color="primary"
            disabled={cart.length === 0}
            fullWidth
            size="large"
            onClick={handleOpenCheckout}
          >
            Finalizar compra
          </Button>
        </Box>
      </Paper>

      {/* -------- DIALOG: EMPLEADA POR ITEM -------- */}
      <Dialog open={empleadaDialogOpen} onClose={handleCloseEmpleadaDialog} fullWidth maxWidth="xs">
        <DialogTitle>Asignar empleada</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select
              label="Empleada"
              value={empleadaSeleccionadaId}
              onChange={(e) => setEmpleadaSeleccionadaId(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton
                    size="small"
                    color={mostrarNuevaEmpleada ? 'primary' : 'default'}
                    onClick={() => setMostrarNuevaEmpleada((p) => !p)}
                    edge="end"
                  >
                    <AddCircleOutlineIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            >
              <MenuItem value="">Sin empleada</MenuItem>
              {empleadas.map((empleada) => (
                <MenuItem key={empleada.id} value={empleada.id}>
                  {empleada.nombre}
                </MenuItem>
              ))}
            </TextField>

            {mostrarNuevaEmpleada && (
              <>
                <TextField
                  label="Nombre de la empleada"
                  value={nuevaEmpleada.nombre}
                  onChange={(e) => setNuevaEmpleada(prev => ({ ...prev, nombre: e.target.value }))}
                  fullWidth
                  autoFocus
                />
                <TextField
                  label="Teléfono"
                  value={nuevaEmpleada.telefono}
                  onChange={(e) => setNuevaEmpleada(prev => ({ ...prev, telefono: e.target.value }))}
                  fullWidth
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseEmpleadaDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleConfirmEmpleada}>
            Agregar al carrito
          </Button>
        </DialogActions>
      </Dialog>

      {/* -------- DIALOG: DATOS DEL CLIENTE -------- */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle>Datos del cliente</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Autocomplete
              fullWidth
              freeSolo                          // permite escribir valores no existentes
              options={clientes}                // [{ id, nombre, telefono }, ...]
              getOptionLabel={(option) =>
                typeof option === 'string' ? option : option.nombre
              }
              value={esClienteExistente ? clienteSeleccionado : null}
              inputValue={cliente.nombre}
              onInputChange={(event, newInputValue) => {
                // cuando el usuario escribe
                setCliente(prev => ({ ...prev, nombre: newInputValue }))
                setClienteSeleccionado(null)
                setEsClienteExistente(false)
                // si quieres, limpiar tel cuando cambia el nombre:
                setCliente(prev => ({ ...prev, telefono: '' }))
              }}
              onChange={(event, newValue) => {
                // cuando selecciona algo del dropdown o “confirma” texto
                if (!newValue) {
                  // limpiaron el campo
                  setClienteSeleccionado(null)
                  setEsClienteExistente(false)
                  setCliente(prev => ({ ...prev, telefono: '' }))
                  return
                }

                if (typeof newValue === 'string') {
                  // nombre escrito a mano, no de la lista
                  setCliente(prev => ({ ...prev, nombre: newValue }))
                  setClienteSeleccionado(null)
                  setEsClienteExistente(false)
                  return
                }

                // aquí sí es un cliente de la lista
                setClienteSeleccionado(newValue)
                setCliente({
                  nombre: newValue.nombre,
                  telefono: newValue.telefono ?? '',
                })
                setEsClienteExistente(true)
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  autoFocus
                  label="Nombre completo"
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                />
              )}
            />

            {!esClienteExistente && (
              <TextField
                label="Número de teléfono"
                value={cliente.telefono}
                onChange={(e) =>
                  setCliente(prev => ({ ...prev, telefono: e.target.value }))
                }
                error={!!errors.telefono}
                helperText={errors.telefono}
                fullWidth
                inputMode="tel"
                placeholder="+502 5555 5555"
              />
            )}

            <TextField
              autoFocus
              select
              label="Tipo de Pago"
              value={venta.pago}  // 👈 en vez de venta.empleada
              onChange={(e) =>
                setVenta(prev => ({ ...prev, pago: e.target.value }))
              }
              error={!!errors.pago}
              helperText={errors.pago}
              fullWidth
            >
              {tipoPago.map((pago) => (
                <MenuItem key={pago.id} value={pago.nombre}>
                  {pago.nombre}
                </MenuItem>
              ))}
            </TextField>

            {requiereReferencia && (
              <TextField
                label="Referencia"
                value={venta.referencia}
                onChange={(e) =>
                  setVenta(prev => ({ ...prev, referencia: e.target.value }))
                }
                error={!!errors.referencia}
                helperText={errors.referencia}
                fullWidth
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleConfirmCheckout}>
            Confirmar pedido
          </Button>
        </DialogActions>
      </Dialog>

      {/* -------- SNACKBAR -------- */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
