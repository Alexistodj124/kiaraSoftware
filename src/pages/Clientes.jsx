import * as React from 'react'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Stack, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider
} from '@mui/material'
import dayjs from 'dayjs'

// ---------- Datos de ejemplo; reemplaza por tu API/DB ----------
const ORDENES = [
  {
    id: 'ORD-001',
    fecha: '2025-11-10T10:10:00Z',
    cliente: { id: 'CLI-1', nombre: 'Ana López', telefono: '+502 5555 1111' },
    items: [
      { id: 1, name: 'Shampoo pH Neutro 1L', sku: 'SH-001', price: 89.9, qty: 1 },
      { id: 2, name: 'Toalla Secado 1200gsm', sku: 'TS-1200', price: 99.0, qty: 2 },
    ],
  },
  {
    id: 'ORD-002',
    fecha: '2025-11-11T16:40:00Z',
    cliente: { id: 'CLI-2', nombre: 'Carlos Méndez', telefono: '+502 5555 2222' },
    items: [
      { id: 3, name: 'Cera Sintética 500ml', sku: 'CE-500', price: 129.0, qty: 1 },
    ],
  },
  {
    id: 'ORD-003',
    fecha: '2025-11-12T03:20:00Z',
    cliente: { id: 'CLI-1', nombre: 'Ana López', telefono: '+502 5555 1111' },
    items: [
      { id: 4, name: 'Guante Microfibra Premium', sku: 'GM-010', price: 59.5, qty: 3 },
      { id: 5, name: 'Ambientador New Car', sku: 'AN-001', price: 25.0, qty: 2 },
    ],
  },
]

function calcTotal(items) {
  return items.reduce((s, it) => s + it.price * it.qty, 0)
}

export default function Clientes() {
  const [query, setQuery] = React.useState('')
  const [clienteSel, setClienteSel] = React.useState(null)   // objeto cliente
  const [ordenSel, setOrdenSel] = React.useState(null)       // objeto orden

  // ---- Agregar/actualizar clientes agregando info agregada desde las órdenes ----
  const clientes = React.useMemo(() => {
    const map = new Map()
    for (const o of ORDENES) {
      const key = o.cliente.id || o.cliente.telefono || o.cliente.nombre
      const totalOrden = calcTotal(o.items)
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          nombre: o.cliente.nombre,
          telefono: o.cliente.telefono,
          ordenes: [o],
          total: totalOrden,
          ultima: o.fecha,
        })
      } else {
        const c = map.get(key)
        c.ordenes.push(o)
        c.total += totalOrden
        c.ultima = dayjs(o.fecha).isAfter(dayjs(c.ultima)) ? o.fecha : c.ultima
      }
    }
    // a arreglo
    let arr = Array.from(map.values())
    // filtro por texto
    if (query.trim()) {
      const q = query.toLowerCase()
      arr = arr.filter(c =>
        (c.nombre || '').toLowerCase().includes(q) ||
        (c.telefono || '').toLowerCase().includes(q)
      )
    }
    // ordenar por última compra desc
    arr.sort((a, b) => dayjs(b.ultima).valueOf() - dayjs(a.ultima).valueOf())
    return arr
  }, [query])

  // Ordenes del cliente seleccionado
  const ordenesCliente = React.useMemo(() => {
    if (!clienteSel) return []
    return clienteSel.ordenes
      .slice()
      .sort((a, b) => dayjs(b.fecha).valueOf() - dayjs(a.fecha).valueOf())
  }, [clienteSel])

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Clientes
      </Typography>

      {/* Filtros / búsqueda */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Buscar cliente (nombre o teléfono)"
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
          />
          <Chip label={`Clientes: ${clientes.length}`} />
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {/* -------- Tabla de clientes -------- */}
        <TableContainer component={Paper} sx={{ borderRadius: 3, flex: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell align="right">Órdenes</TableCell>
                <TableCell align="right">Total gastado</TableCell>
                <TableCell>Última compra</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.map(c => (
                <TableRow
                  key={c.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setClienteSel(c)}
                  selected={clienteSel?.id === c.id}
                >
                  <TableCell>{c.nombre}</TableCell>
                  <TableCell>{c.telefono}</TableCell>
                  <TableCell align="right">{c.ordenes.length}</TableCell>
                  <TableCell align="right">Q {c.total.toFixed(2)}</TableCell>
                  <TableCell>{dayjs(c.ultima).format('YYYY-MM-DD HH:mm')}</TableCell>
                </TableRow>
              ))}
              {clientes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography align="center" color="text.secondary">
                      No hay clientes que coincidan
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* -------- Detalle: órdenes del cliente seleccionado -------- */}
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, flex: 1, minWidth: 420 }}
        >
          <Box sx={{ p: 2, pb: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {clienteSel ? `Órdenes de ${clienteSel.nombre}` : 'Selecciona un cliente'}
            </Typography>
            {clienteSel && (
              <Typography variant="body2" color="text.secondary">
                {clienteSel.telefono} — Total gastado: Q {clienteSel.total.toFixed(2)}
              </Typography>
            )}
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>No. Orden</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordenesCliente.map(o => (
                <TableRow
                  key={o.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setOrdenSel(o)}
                >
                  <TableCell>{dayjs(o.fecha).format('YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell>{o.id}</TableCell>
                  <TableCell align="right">Q {calcTotal(o.items).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {clienteSel && ordenesCliente.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography align="center" color="text.secondary">
                      Este cliente no tiene órdenes
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      {/* -------- Dialog Detalle de Orden (igual que en Reportes) -------- */}
      <Dialog open={!!ordenSel} onClose={() => setOrdenSel(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Orden {ordenSel?.id}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Fecha: {ordenSel ? dayjs(ordenSel.fecha).format('YYYY-MM-DD HH:mm') : '--'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cliente: {ordenSel?.cliente?.nombre} — {ordenSel?.cliente?.telefono}
            </Typography>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Cant.</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordenSel?.items?.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.name}</TableCell>
                  <TableCell>{it.sku}</TableCell>
                  <TableCell align="right">Q {it.price.toFixed(2)}</TableCell>
                  <TableCell align="right">{it.qty}</TableCell>
                  <TableCell align="right">Q {(it.price * it.qty).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} align="right" sx={{ fontWeight: 600 }}>
                  Total
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Q {ordenSel ? calcTotal(ordenSel.items).toFixed(2) : '0.00'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrdenSel(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
