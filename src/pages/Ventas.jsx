// src/pages/Inventory.jsx
import * as React from 'react'
import {
  Box, Grid, Typography, Divider, List, ListItem, ListItemText,
  IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, Snackbar, Alert, MenuItem
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CategoryBar from '../components/CategoryBar'
import ProductCard from '../components/ProductCard'

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



export default function Inventory() {
  const [category, setCategory] = React.useState('all')
  const [cart, setCart] = React.useState([])

  // Dialog de datos del cliente
  const [openDialog, setOpenDialog] = React.useState(false)
  const [cliente, setCliente] = React.useState({ nombre: '', telefono: '' })
  const [venta, setVenta] = React.useState({ empleada: '', pago: '' , referencia: ''})
  const [errors, setErrors] = React.useState({ nombre: '', telefono: '' })

  const requiereReferencia =
    venta.pago === 'Tarjeta' || venta.pago === 'Transferencia'
    
  // Snackbar de confirmación
  const [snack, setSnack] = React.useState({ open: false, msg: '', severity: 'success' })

  const filtered = React.useMemo(() => {
    if (category === 'all') return PRODUCTS
    return PRODUCTS.filter(p => p.cat === category)
  }, [category])

  const addToCart = (prod) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === prod.id)
      if (existing) return prev.map(p => p.id === prod.id ? { ...p, qty: p.qty + 1 } : p)
      return [...prev, { ...prod, qty: 1 }]
    })
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(p => p.id !== id))

  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0)

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
    const e = { nombre: '', telefono: '' }

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
    setErrors(e)
    return ok
  }

  const handleConfirmCheckout = () => {
    if (!validate()) return

    // Construye el "pedido"
    const pedido = {
      cliente: { ...cliente },
      items: cart.map(({ id, name, sku, price, qty }) => ({ id, name, sku, price, qty })),
      total: Number(total.toFixed(2)),
      fecha: new Date().toISOString(),
    }

    // Aquí harías tu POST a la API / guardar en Firestore / etc.
    console.log('Pedido listo para enviar:', pedido)

    // Feedback y clean-up
    setSnack({ open: true, msg: 'Pedido creado correctamente ✅', severity: 'success' })
    setOpenDialog(false)
    setCliente({ nombre: '', telefono: '' })
    setCart([]) // opcional: vaciar carrito al confirmar
  }

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {/* -------- IZQUIERDA: INVENTARIO -------- */}
      <Box sx={{ flex: 3 }}>
        <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600 }}>
          Inventario
        </Typography>

        <CategoryBar
          categories={CATEGORIES}
          selected={category}
          onSelect={setCategory}
        />

        <Grid container spacing={2}>
          {filtered.map(prod => (
            <Grid key={prod.id} item xs={6} sm={4} md={3}>
              <ProductCard product={prod} onClick={() => addToCart(prod)} />
            </Grid>
          ))}
          {filtered.length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary">No hay productos en esta categoría</Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* -------- DERECHA: CARRITO -------- */}
      <Box
        sx={{
          flex: 1,
          borderLeft: 1,
          borderColor: 'divider',
          p: 2,
          minWidth: 300,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          height: '80vh',
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          🛒 Carrito
        </Typography>
        <Divider sx={{ mb: 1 }} />

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <List dense>
            {cart.map(item => (
              <ListItem
                key={item.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => removeFromCart(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${item.name}`}
                  secondary={`Q ${item.price.toFixed(2)} x ${item.qty}`}
                />
              </ListItem>
            ))}
          </List>

          {cart.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
              No hay productos en el carrito
            </Typography>
          )}
        </Box>

        <Divider sx={{ mt: 1, mb: 2 }} />

        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Total: Q {total.toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            disabled={cart.length === 0}
            sx={{ mt: 1 }}
            onClick={handleOpenCheckout}
          >
            Finalizar compra
          </Button>
        </Box>
      </Box>

      {/* -------- DIALOG: DATOS DEL CLIENTE -------- */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle>Datos del cliente</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              label="Nombre completo"
              value={cliente.nombre}
              onChange={(e) => setCliente(prev => ({ ...prev, nombre: e.target.value }))}
              error={!!errors.nombre}
              helperText={errors.nombre}
              fullWidth
            />
            <TextField
              label="Número de teléfono"
              value={cliente.telefono}
              onChange={(e) => setCliente(prev => ({ ...prev, telefono: e.target.value }))}
              error={!!errors.telefono}
              helperText={errors.telefono}
              fullWidth
              inputMode="tel"
              placeholder="+502 5555 5555"
            />
            <TextField
              autoFocus
              select
              label="Empleada"
              value={venta.empleada}
              onChange={(e) => setVenta(prev => ({ ...prev, empleada: e.target.value }))}
              error={!!errors.empleada}
              helperText={errors.empleada}
              fullWidth
            >
              {empleadas.map((empleada) => (
                <MenuItem key={empleada.id} value={empleada.nombre}>
                  {empleada.nombre}
                </MenuItem>
              ))}
            </TextField>
            {/* <TextField
              autoFocus
              select
              label="Tipo de Pago"
              value={venta.empleada}
              onChange={(e) => setVenta(prev => ({ ...prev, pago: e.target.value }))}
              error={!!errors.pago}
              helperText={errors.pago}
              fullWidth
            >
              {tipoPago.map((pago) => (
                <MenuItem key={pago.id} value={pago.nombre}>
                  {pago.nombre}
                </MenuItem>
              ))}
            </TextField> */}
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
        <DialogActions>
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
    </Box>
  )
}
