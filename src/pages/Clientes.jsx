import * as React from 'react'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Stack, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider,
  InputAdornment
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import PortraitIcon from '@mui/icons-material/Portrait'
import { alpha } from '@mui/material/styles'
import dayjs from 'dayjs'
import { API_BASE_URL } from '../config/api'

// Calcula total de una orden a partir de sus items
function calcTotal(items = []) {
  return items.reduce((s, it) => {
    const precio = it.precio ?? it.price ?? it.precio_unitario ?? 0
    const qty = it.cantidad ?? it.qty ?? 1
    return s + precio * qty
  }, 0)
}

export default function Clientes() {
  const [query, setQuery] = React.useState('')
  const [ordenes, setOrdenes] = React.useState([])
  const [clienteSel, setClienteSel] = React.useState(null)   // objeto cliente agregado
  const [ordenSel, setOrdenSel] = React.useState(null)       // objeto orden para el diálogo

  // Cargar órdenes desde el backend
  React.useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ordenes`)
        if (!res.ok) {
          const txt = await res.text()
          console.error('Error backend /ordenes:', txt)
          return
        }
        const data = await res.json()
        console.log('Ordenes cargadas:', data)
        setOrdenes(data)
      } catch (err) {
        console.error('Error de red al cargar ordenes:', err)
      }
    }

    cargarOrdenes()
  }, [])

  // ---- Construir "clientes" agregando info desde las órdenes ----
  const clientes = React.useMemo(() => {
    const map = new Map()

    for (const o of ordenes) {
      const cli = o.cliente || {}
      const key = cli.id || cli.telefono || cli.nombre
      if (!key) continue

      const totalOrden = calcTotal(o.items || [])

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          nombre: cli.nombre,
          telefono: cli.telefono,
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

    let arr = Array.from(map.values())

    // filtro por texto (nombre o teléfono)
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
  }, [ordenes, query])

  // Órdenes del cliente seleccionado
  const ordenesCliente = React.useMemo(() => {
    if (!clienteSel) return []
    return clienteSel.ordenes
      .slice()
      .sort((a, b) => dayjs(b.fecha).valueOf() - dayjs(a.fecha).valueOf())
  }, [clienteSel])

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', mt: { xs: 1, md: 2 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          mb: 2.5,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, fontSize: { xs: '1.4rem', md: '1.6rem' } }}
          >
            Clientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Historial de compras por cliente
          </Typography>
        </Box>
        <Chip
          icon={<PortraitIcon fontSize="small" />}
          label={`${clientes.length} ${clientes.length === 1 ? 'cliente' : 'clientes'}`}
          sx={{
            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.16),
            color: 'secondary.main',
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Filtros / búsqueda */}
      <Paper sx={{ p: { xs: 1.5, md: 2 }, mb: 2 }}>
        <TextField
          placeholder="Buscar cliente por nombre o teléfono"
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {/* -------- Tabla de clientes -------- */}
        <Paper sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <Box sx={{ p: 2, pb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Directorio
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Selecciona un cliente para ver sus órdenes
            </Typography>
          </Box>
          <Divider />
          <TableContainer sx={{ overflowX: 'auto', borderRadius: 0 }}>
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
                    <TableCell sx={{ fontWeight: 500 }}>{c.nombre}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{c.telefono}</TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        label={c.ordenes.length}
                        sx={{
                          height: 22,
                          minWidth: 28,
                          fontWeight: 600,
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Q {c.total.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {dayjs(c.ultima).format('YYYY-MM-DD HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
                {clientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography
                        align="center"
                        color="text.secondary"
                        sx={{ py: 3 }}
                      >
                        No hay clientes que coincidan
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* -------- Detalle: órdenes del cliente seleccionado -------- */}
        <Paper
          sx={{
            flex: 1,
            minWidth: { xs: 'auto', md: 380 },
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, pb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {clienteSel ? `Órdenes de ${clienteSel.nombre}` : 'Selecciona un cliente'}
            </Typography>
            {clienteSel ? (
              <Typography variant="caption" color="text.secondary">
                {clienteSel.telefono} · Total gastado:{' '}
                <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Q {clienteSel.total.toFixed(2)}
                </Box>
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Aparecerán las órdenes del cliente seleccionado
              </Typography>
            )}
          </Box>
          <Divider />
          <TableContainer sx={{ overflowX: 'auto', borderRadius: 0 }}>
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
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {dayjs(o.fecha).format('YYYY-MM-DD HH:mm')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{o.codigo || o.id}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Q {calcTotal(o.items).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                {clienteSel && ordenesCliente.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography
                        align="center"
                        color="text.secondary"
                        sx={{ py: 3 }}
                      >
                        Este cliente no tiene órdenes
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!clienteSel && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography
                        align="center"
                        color="text.secondary"
                        sx={{ py: 3 }}
                      >
                        Selecciona un cliente para ver sus órdenes
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>

      {/* -------- Dialog Detalle de Orden -------- */}
      <Dialog open={!!ordenSel} onClose={() => setOrdenSel(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Orden {ordenSel?.codigo || ordenSel?.id}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <Box component="span" sx={{ fontWeight: 500 }}>Fecha: </Box>
              {ordenSel ? dayjs(ordenSel.fecha).format('YYYY-MM-DD HH:mm') : '--'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Box component="span" sx={{ fontWeight: 500 }}>Cliente: </Box>
              {ordenSel?.cliente?.nombre} — {ordenSel?.cliente?.telefono}
            </Typography>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto / Servicio</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Cant.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordenSel?.items?.map((it) => {
                  const nombre =
                    it.nombre ||
                    it.name ||
                    (it.producto_id
                      ? `Producto #${it.producto_id}`
                      : it.servicio_id
                      ? `Servicio #${it.servicio_id}`
                      : `Item ${it.id}`)

                  const sku =
                    it.sku ||
                    (it.producto_id
                      ? `PROD-${it.producto_id}`
                      : it.servicio_id
                      ? `SERV-${it.servicio_id}`
                      : '')

                  const precio = it.precio ?? it.price ?? it.precio_unitario ?? 0
                  const qty = it.cantidad ?? it.qty ?? 1
                  const subtotal = precio * qty

                  return (
                    <TableRow key={it.id}>
                      <TableCell>{nombre}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{sku}</TableCell>
                      <TableCell align="right">Q {precio.toFixed(2)}</TableCell>
                      <TableCell align="right">{qty}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        Q {subtotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )
                })}
                <TableRow>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: 600 }}>
                    Total
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700, color: 'primary.main' }}
                  >
                    Q {ordenSel ? calcTotal(ordenSel.items).toFixed(2) : '0.00'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOrdenSel(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
