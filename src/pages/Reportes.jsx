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
      <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Reportes de ventas
        </Typography>

        
        <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
          {/* Fila original: rango de fechas + total período */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
          >
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

            <Chip
              label={`Total en el período: Q ${totalPeriodo.toFixed(2)}`}
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          {/* Nueva fila: empleada + porcentaje + total comisión */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            sx={{ mt: 2 }}
          >
            {/* Dropdown Empleada */}
            <TextField
              select
              label="Empleada"
              size="small"
              value={empleadaSel}
              onChange={(e) => setEmpleadaSel(e.target.value)}
              sx={{ minWidth: 180, maxWidth: 220 }}
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

            {/* Filtro por tipo de item */}
            <TextField
              select
              label="Tipo de item"
              size="small"
              value={tipoItemFiltro}
              onChange={(e) => setTipoItemFiltro(e.target.value)}
              sx={{ minWidth: 180, maxWidth: 220 }}
            >
              <MenuItem value="">Productos y servicios</MenuItem>
              <MenuItem value="producto">Productos</MenuItem>
              <MenuItem value="servicio">Servicios</MenuItem>
            </TextField>



            {/* Porcentaje comisión */}
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
              sx={{ minWidth: 140, maxWidth: 200 }}
            />

            {/* Total comisión */}
            <Chip
              label={`Total comisión: Q ${totalComision.toFixed(2)}`}
              color="secondary"
              sx={{ fontWeight: 600 }}
            />

            {/* Ganancia neta (solo sin filtros) */}
            <Chip
              label={gananciaNeta !== null
                ? `Ganancia neta: Q ${gananciaNeta.toFixed(2)}`
                : 'Ganancia neta solo sin filtros'}
              color={gananciaNeta !== null ? 'success' : 'default'}
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
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
                  <TableCell>{dayjs(o.fecha).format('YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell>{o.codigo ?? o.id}</TableCell>
                  <TableCell>{o.cliente?.nombre}</TableCell>
                  <TableCell>{o.tipo_pago || 'N/D'}</TableCell>
                  <TableCell align="right">
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
                    <Typography color="text.secondary" align="center">
                      No hay ventas en el rango seleccionado
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

          </Table>
        </TableContainer>

        {/* -------- Dialog Detalle de Orden -------- */}
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
              <Typography variant="body2" color="text.secondary">
                Tipo de pago: {ordenSel?.tipo_pago || 'N/D'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Referencia: {ordenSel?.referencia || 'N/D'}
              </Typography>
            </Stack>

            <Divider sx={{ mb: 2 }} />

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
                      <TableCell>{sku}</TableCell>
                      <TableCell>{empleadaNombre}</TableCell>
                      <TableCell align="right">Q {price.toFixed(2)}</TableCell>
                      <TableCell align="right">{qty}</TableCell>
                      <TableCell align="right">Q {(price * qty).toFixed(2)}</TableCell>
                    </TableRow>
                  )
                })}


                <TableRow>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: 600 }}>
                    Total
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Q {ordenSel ? calcTotalConDescuento(ordenSel, ordenSel.items).toFixed(2) : '0.00'}
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
    </LocalizationProvider>
  )
}
