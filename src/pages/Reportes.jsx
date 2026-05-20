import * as React from 'react'
import {
  Box, Paper, Typography, Stack, Divider, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, MenuItem, InputAdornment, IconButton
} from '@mui/material'
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { API_BASE_URL } from '../config/api'
import DeleteIcon from '@mui/icons-material/Delete'
import AreaChartIcon from '@mui/icons-material/AreaChart'
import { alpha } from '@mui/material/styles'
dayjs.extend(isBetween)

// Util: calcular total
function calcTotal(items) {
  return items.reduce((s, it) => {
    const price = it.price ?? it.precio_unitario ?? 0   // mock vs backend
    const qty   = it.qty   ?? it.cantidad       ?? 1
    return s + price * qty
  }, 0)
}

// Devuelve el porcentaje de descuento aplicado a la orden (0 a 1)
function obtenerPctDescuento(orden) {
  const descuento = Number(orden?.descuento ?? 0)
  const totalPagado = Number(orden?.total ?? 0)
  if (descuento <= 0 || totalPagado < 0) return 0
  const subtotal = totalPagado + descuento
  if (subtotal <= 0) return 0
  return Math.min(0.99, descuento / subtotal)
}

// Calcula el total visible aplicando el mismo % de descuento que tuvo la orden completa
function calcTotalConDescuento(orden, itemsVisibles) {
  const base = calcTotal(itemsVisibles || [])
  const pctDesc = obtenerPctDescuento(orden)
  return base * (1 - pctDesc)
}

function MetricCard({ label, value, color = 'primary.main', emphasis = false }) {
  return (
    <Paper
      sx={(theme) => ({
        flex: 1,
        minWidth: 0,
        p: 2,
        bgcolor: emphasis ? alpha(theme.palette.primary.main, 0.06) : 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', fontWeight: 500, letterSpacing: '0.04em' }}
      >
        {label}
      </Typography>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color, mt: 0.5, fontSize: { xs: '1.05rem', md: '1.2rem' } }}
      >
        {value}
      </Typography>
    </Paper>
  )
}

export default function Reportes() {
  const [ordenSel, setOrdenSel] = React.useState(null)
  const [empleadas, setEmpleadas] = React.useState([])
  const [ordenes, setOrdenes] = React.useState([])
  const [empleadaSel, setEmpleadaSel] = React.useState('')
  const [tipoItemFiltro, setTipoItemFiltro] = React.useState('')
  const [range, setRange] = React.useState([
    dayjs().startOf('month'),
    dayjs().endOf('day'),
  ])
  const [deletingId, setDeletingId] = React.useState(null)

  const filtered = React.useMemo(() => {
    const porOrden = ordenes.map((o) => {
      const itemsFiltrados = (o.items || []).filter((it) => {
        const nombreEmp =
          typeof it.empleada === 'string'
            ? it.empleada
            : it.empleada?.nombre

        const pasaEmpleada = !empleadaSel || nombreEmp === empleadaSel
        const pasaTipo = !tipoItemFiltro || it.tipo === tipoItemFiltro
        return pasaEmpleada && pasaTipo
      })

      if (!itemsFiltrados.length) return null
      return { ...o, items: itemsFiltrados }
    }).filter(Boolean)

    return porOrden
  }, [ordenes, empleadaSel, tipoItemFiltro])

  // 🔹 GET /ordenes?inicio=...&fin=...
  const cargarOrdenes = async (inicioIso, finIso) => {
    try {
      const params = new URLSearchParams()
      if (inicioIso) params.append('inicio', inicioIso)
      if (finIso)    params.append('fin',    finIso)

      const res = await fetch(`${API_BASE_URL}/ordenes?${params.toString()}`)
      if (!res.ok) throw new Error('Error al obtener órdenes')

      const data = await res.json()
      setOrdenes(data)   // array de ordenes desde el back
    } catch (err) {
      console.error(err)
    }
  }

  const cargarEmpleadas = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/empleadas`)
      if (!res.ok) throw new Error('Error al obtener empleadas')
      const data = await res.json()
      setEmpleadas(data)
    } catch (err) {
      console.error(err)
    }
  }
  const totalPeriodo = filtered.reduce(
    (acc, o) => acc + calcTotalConDescuento(o, o.items || []),
    0
  )
  const totalCostos = filtered.reduce((acc, o) => {
    const costoItems = (o.items || []).reduce((s, it) => {
      const costoUnit =
        it.cost ??
        it.costo ??
        it.producto?.costo ??
        it.servicio?.costo ??
        0
      const qty = it.qty ?? it.cantidad ?? 1
      return s + costoUnit * qty
    }, 0)
    return acc + costoItems
  }, 0)

  const gananciaNeta =
    !empleadaSel && !tipoItemFiltro
      ? totalPeriodo - totalCostos
      : null

  const [porcentajeComision, setPorcentajeComision] = React.useState(0);

  const totalComision = React.useMemo(
    () => (porcentajeComision ? (totalPeriodo * porcentajeComision) / 100 : 0),
    [totalPeriodo, porcentajeComision]
  )

  const handleDeleteOrden = async (ordenId) => {
    if (!ordenId) return
    const confirmed = window.confirm('¿Eliminar esta orden?')
    if (!confirmed) return
    try {
      setDeletingId(ordenId)
      const res = await fetch(`${API_BASE_URL}/ordenes/${ordenId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar la orden')
      setOrdenes((prev) => prev.filter((o) => String(o.id) !== String(ordenId) && String(o.codigo) !== String(ordenId)))
      setOrdenSel(null)
    } catch (err) {
      console.error(err)
      alert('No se pudo eliminar la orden')
    } finally {
      setDeletingId(null)
    }
  }

    // 🔹 Cargar empleadas una vez
  React.useEffect(() => {
    cargarEmpleadas()
  }, [])

  // 🔹 Cada vez que cambia el rango, pedir órdenes al backend
  React.useEffect(() => {
    const [from, to] = range
    if (!from || !to) return

    const inicioIso = from.startOf('day').toDate().toISOString()
    const finIso    = to.endOf('day').toDate().toISOString()

    cargarOrdenes(inicioIso, finIso)
  }, [range])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          maxWidth: { xs: '100%', md: 1180 },
          mx: 'auto',
          mt: { xs: 1, md: 2 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 2.5,
            flexWrap: 'wrap',
          }}
        >
          <Box
            sx={(theme) => ({
              width: 44,
              height: 44,
              borderRadius: 12 / 8,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            })}
          >
            <AreaChartIcon />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, fontSize: { xs: '1.4rem', md: '1.6rem' } }}
            >
              Reportes de ventas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resumen de ingresos por período, empleada y tipo
            </Typography>
          </Box>
        </Box>

        <Paper sx={{ p: { xs: 2, md: 2.5 }, mb: 2 }}>
          {/* Fila 1: rango de fechas */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 1, fontWeight: 600, letterSpacing: '0.04em' }}
            >
              PERÍODO
            </Typography>
            <DateRangePicker
              calendars={2}
              value={range}
              onChange={(newVal) => setRange(newVal)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
              localeText={{ start: 'Desde', end: 'Hasta' }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Fila 2: filtros */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 1, fontWeight: 600, letterSpacing: '0.04em' }}
          >
            FILTROS
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ flexWrap: 'wrap' }}
          >
            <TextField
              select
              label="Empleada"
              size="small"
              value={empleadaSel}
              onChange={(e) => setEmpleadaSel(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 180 }, flex: { sm: 1 } }}
            >
              <MenuItem value="">
                Todas
              </MenuItem>

              {empleadas.map((emp) => (
                <MenuItem key={emp.id} value={emp.nombre}>
                  {emp.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Tipo de item"
              size="small"
              value={tipoItemFiltro}
              onChange={(e) => setTipoItemFiltro(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 180 }, flex: { sm: 1 } }}
            >
              <MenuItem value="">Productos y servicios</MenuItem>
              <MenuItem value="producto">Productos</MenuItem>
              <MenuItem value="servicio">Servicios</MenuItem>
            </TextField>

            <TextField
              label="% Comisión"
              size="small"
              type="number"
              value={porcentajeComision}
              onChange={(e) =>
                setPorcentajeComision(Number(e.target.value) || 0)
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">%</InputAdornment>
                ),
              }}
              sx={{ minWidth: { xs: '100%', sm: 140 }, flex: { sm: 1 } }}
            />
          </Stack>
        </Paper>

        {/* Métricas */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ mb: 2.5 }}
        >
          <MetricCard
            label="TOTAL DEL PERÍODO"
            value={`Q ${totalPeriodo.toFixed(2)}`}
            emphasis
          />
          <MetricCard
            label="TOTAL COMISIÓN"
            value={`Q ${totalComision.toFixed(2)}`}
            color="secondary.main"
          />
          <MetricCard
            label="GANANCIA NETA"
            value={
              gananciaNeta !== null
                ? `Q ${gananciaNeta.toFixed(2)}`
                : '—'
            }
            color={gananciaNeta !== null ? 'success.main' : 'text.secondary'}
          />
        </Stack>

        <Paper sx={{ overflow: 'hidden' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Detalle de órdenes
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filtered.length} {filtered.length === 1 ? 'orden' : 'órdenes'} en el período
            </Typography>
          </Box>
          <Divider />
          <TableContainer sx={{ overflowX: 'auto', borderRadius: 0 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>No. Orden</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Tipo de pago</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow
                    key={o.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setOrdenSel(o)}
                  >
                    <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {dayjs(o.fecha).format('YYYY-MM-DD HH:mm')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{o.codigo ?? o.id}</TableCell>
                    <TableCell>{o.cliente?.nombre}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={o.tipo_pago || 'N/D'}
                        variant="outlined"
                        sx={{ height: 22, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Q {calcTotalConDescuento(o, o.items || []).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteOrden(o.id ?? o.codigo)
                        }}
                        disabled={deletingId === (o.id ?? o.codigo)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography
                        color="text.secondary"
                        align="center"
                        sx={{ py: 4 }}
                      >
                        No hay ventas en el rango seleccionado
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </TableContainer>
        </Paper>

        {/* -------- Dialog Detalle de Orden -------- */}
        <Dialog open={!!ordenSel} onClose={() => setOrdenSel(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Orden {ordenSel?.id}</DialogTitle>
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
              <Typography variant="body2" color="text.secondary">
                <Box component="span" sx={{ fontWeight: 500 }}>Tipo de pago: </Box>
                {ordenSel?.tipo_pago || 'N/D'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <Box component="span" sx={{ fontWeight: 500 }}>Referencia: </Box>
                {ordenSel?.referencia || 'N/D'}
              </Typography>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Empleada</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Cant.</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ordenSel?.items?.map((it) => {
                    let nombre = ''
                    if (it.tipo === 'servicio') {
                      nombre =
                        it.servicio?.descripcion ||
                        it.nombre ||
                        `Servicio #${it.servicio_id ?? it.id}`
                    } else { // asumimos 'producto'
                      nombre =
                        it.producto?.descripcion ||
                        it.nombre ||
                        `Producto #${it.producto_id ?? it.id}`
                    }

                    // 🔹 SKU según tipo
                    let sku = ''
                    if (it.tipo === 'servicio') {
                      sku =
                        it.sku ||
                        (it.servicio_id ? `SERV-${it.servicio_id}` : '')
                    } else {
                      sku =
                        it.sku ||
                        (it.producto_id ? `PROD-${it.producto_id}` : '')
                    }

                    const price =
                      it.price ??                        // mock
                      it.precio_unitario ??              // backend snapshot
                      it.producto?.precio ??             // por si usas precio del producto
                      it.servicio?.precio ?? 0

                    const qty = it.qty ?? it.cantidad ?? 1
                    const empleadaNombre =
                      typeof it.empleada === 'string'
                        ? it.empleada
                        : it.empleada?.nombre ?? 'N/A'

                    return (
                      <TableRow key={it.id}>
                        <TableCell>{nombre}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{sku}</TableCell>
                        <TableCell>{empleadaNombre}</TableCell>
                        <TableCell align="right">Q {price.toFixed(2)}</TableCell>
                        <TableCell align="right">{qty}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                          Q {(price * qty).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )
                  })}


                  <TableRow>
                    <TableCell colSpan={5} align="right" sx={{ fontWeight: 600 }}>
                      Total
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      Q {ordenSel ? calcTotalConDescuento(ordenSel, ordenSel.items).toFixed(2) : '0.00'}
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
    </LocalizationProvider>
  )
}
