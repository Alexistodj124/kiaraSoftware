import * as React from 'react'
import {
  Box, Paper, Typography, Stack, Divider, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, MenuItem, InputAdornment
} from '@mui/material'
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

// --- Datos de ejemplo (luego los reemplazas por tu API/DB) ---
const ORDENES = [
  {
    id: 'ORD-001',
    fecha: '2025-11-10T10:10:00Z',
    cliente: { nombre: 'Ana López', telefono: '+502 5555 1111' },
    items: [
      { id: 1, name: 'Shampoo pH Neutro 1L', sku: 'SH-001', price: 89.9, qty: 1 },
      { id: 2, name: 'Toalla Secado 1200gsm', sku: 'TS-1200', price: 99.0, qty: 2 },
    ],
    empleada: 'Ana',
  },
  {
    id: 'ORD-002',
    fecha: '2025-11-11T16:40:00Z',
    cliente: { nombre: 'Carlos Méndez', telefono: '+502 5555 2222' },
    items: [
      { id: 3, name: 'Cera Sintética 500ml', sku: 'CE-500', price: 129.0, qty: 1 },
    ],
    empleada: 'María',
  },
  {
    id: 'ORD-003',
    fecha: '2025-11-12T03:20:00Z',
    cliente: { nombre: 'María Díaz', telefono: '+502 5555 3333' },
    items: [
      { id: 4, name: 'Guante Microfibra Premium', sku: 'GM-010', price: 59.5, qty: 3 },
      { id: 5, name: 'Ambientador New Car', sku: 'AN-001', price: 25.0, qty: 2 },
    ],
    empleada: 'Lucía',
  },
]
const empleadas = [
  { id: 1, nombre: 'Ana' },
  { id: 2, nombre: 'María' },
  { id: 3, nombre: 'Lucía' },
]

// Util: calcular total
function calcTotal(items) {
  return items.reduce((s, it) => s + it.price * it.qty, 0)
}

export default function Reportes() {
  const [range, setRange] = React.useState([dayjs().startOf('month'), dayjs().endOf('day')])
  const [ordenSel, setOrdenSel] = React.useState(null)
  const [empleada, setEmpleada] = React.useState('');

  const filtered = React.useMemo(() => {
    const [from, to] = range
    if (!from || !to) return ORDENES

    return ORDENES.filter(o => {
      const d = dayjs(o.fecha)

      const dentroDeRango = d.isBetween(
        from.startOf('day'),
        to.endOf('day'),
        'millisecond',
        '[]' // inclusivo
      )

      const coincideEmpleada =
        !empleada || o.empleada === empleada   // 👈 si no hay empleada seleccionada, muestra todas

      return dentroDeRango && coincideEmpleada
    })
  }, [range, empleada])   // 👈 agrega empleada como dependencia


  const totalPeriodo = filtered.reduce((acc, o) => acc + calcTotal(o.items), 0)

  const [porcentajeComision, setPorcentajeComision] = React.useState(0);

  const totalComision = React.useMemo(
    () => (porcentajeComision ? (totalPeriodo * porcentajeComision) / 100 : 0),
    [totalPeriodo, porcentajeComision]
  );


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
              value={empleada}
              onChange={(e) => setEmpleada(e.target.value)}
              fullWidth
            >
              <MenuItem value="">
                Todas
              </MenuItem>

              {empleadas.map((emp) => (
                <MenuItem key={emp.id} value={emp.nombre}>  {/* 👈 ahora usa el nombre */}
                  {emp.nombre}
                </MenuItem>
              ))}
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
              sx={{ maxWidth: 180 }}
            />

            {/* Total comisión */}
            <Chip
              label={`Total comisión: Q ${totalComision.toFixed(2)}`}
              color="secondary"
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
                <TableCell align="right">Total</TableCell>
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
                  <TableCell>{o.id}</TableCell>
                  <TableCell>{o.cliente?.nombre}</TableCell>
                  <TableCell align="right">Q {calcTotal(o.items).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
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
    </LocalizationProvider>
  )
}
