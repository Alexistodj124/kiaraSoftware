// src/components/ProductCard.jsx
import * as React from 'react'
import {
  Card,
  CardActionArea,
  Box,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import DesignServicesRoundedIcon from '@mui/icons-material/DesignServicesRounded'
import { alpha } from '@mui/material/styles'
import { API_BASE_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'

export default function ProductCard({ product, onClick, onDeleted, onUpdated }) {
  const { id, descripcion, precio, cantidad, imagen } = product
  const esServicio = product?.esServicio || product?.tipo === 'servicio' || cantidad === 9999
  const low = !esServicio && cantidad <= 5
  const { isAdmin } = useAuth()
  const [editOpen, setEditOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [form, setForm] = React.useState({
    sku: product.sku || '',
    descripcion: product.descripcion || '',
    precio: product.precio || 0,
    costo: product.costo || 0,
    cantidad: product.cantidad || 0,
  })

  React.useEffect(() => {
    setForm({
      sku: product.sku || '',
      descripcion: product.descripcion || '',
      precio: product.precio || 0,
      costo: product.costo || 0,
      cantidad: product.cantidad || 0,
    })
  }, [product])

  const wrapDescription = (text, maxCharsPerLine, maxLines, addEllipsis = true) => {
    if (!text) return ''

    const words = text.split(' ')
    const lines = []
    let current = ''

    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const tentative = (current + ' ' + word).trim()

      if (tentative.length > maxCharsPerLine) {
        // cerramos la lA-nea actual
        if (current) lines.push(current.trim())
        else lines.push(word) // por si una palabra sola ya se pasa

        current = ''
        if (lines.length === maxLines) break
      } else {
        current = tentative
      }

      // si ya vamos en la A�ltima palabra
      if (i === words.length - 1 && current && lines.length < maxLines) {
        lines.push(current.trim())
      }

      if (lines.length === maxLines) break
    }

    // si quedaron palabras sin meter, aA�adimos "�?�"
    const totalLength = text.length
    const joined = lines.join(' ')
    if (addEllipsis && totalLength > joined.length) {
      lines[lines.length - 1] = lines[lines.length - 1] + '�?�'
    }

    return lines.join('\n')
  }

  const descFormateada = esServicio
    ? wrapDescription(descripcion, 40, 10, false)
    : wrapDescription(descripcion, 15, 5)

  const handleDelete = async (event) => {
    if (!isAdmin) return
    event.stopPropagation()
    if (deleting) return
    const confirmed = window.confirm('A�Eliminar este producto?')
    if (!confirmed) return

    const resource = esServicio ? 'servicios' : 'productos'

    try {
      setDeleting(true)
      const res = await fetch(`${API_BASE_URL}/${resource}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar item')
      onDeleted?.(id)
      window.location.reload()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!isAdmin) return
    if (saving) return
    try {
      setSaving(true)
      const payload = esServicio
        ? {
            descripcion: form.descripcion,
            precio: Number(form.precio) || 0,
            costo: Number(form.costo) || 0,
            categoria_id:
              product.categoria_id !== undefined && product.categoria_id !== null
                ? Number(product.categoria_id)
                : null,
            imagen: product.imagen ?? null,
          }
        : {
            sku: form.sku || null,
            descripcion: form.descripcion,
            precio: Number(form.precio) || 0,
            costo: Number(form.costo) || 0,
            cantidad: Number(form.cantidad) || 0,
            tienda_id: product.tienda_id ?? null,
            marca_id: product.marca_id ?? null,
            categoria_id: product.categoria_id ?? null,
            talla_id: product.talla_id ?? null,
            imagen: product.imagen ?? null,
          }

      const resource = esServicio ? 'servicios' : 'productos'

      const res = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Error al actualizar producto')

      const updated = await res.json()
      onUpdated?.(updated)
      setEditOpen(false)
      window.location.reload()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card
      sx={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {!esServicio ? (
          // Imagen del producto: full-width con aspect ratio
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderBottom: 1,
              borderColor: 'divider',
              width: '100%',
              aspectRatio: '4 / 3',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
            }}
          >
            {imagen ? (
              <Box
                component="img"
                alt={descripcion}
                src={imagen}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Typography variant="overline" color="text.secondary">
                  SIN IMAGEN
                </Typography>
              </Box>
            )}

            <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
              <Chip
                size="small"
                label={low ? 'Bajo stock' : 'En stock'}
                color={low ? 'warning' : 'success'}
                sx={{
                  bgcolor: low ? 'warning.main' : 'success.main',
                  color: '#fff',
                  height: 22,
                  fontSize: '0.7rem',
                }}
              />
            </Box>
          </Box>
        ) : (
          // Encabezado decorativo para servicios
          <Box
            sx={{
              width: '100%',
              aspectRatio: '4 / 2',
              display: 'grid',
              placeItems: 'center',
              background: (theme) =>
                `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.16)}, ${alpha(theme.palette.primary.main, 0.08)})`,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
              }}
            >
              <DesignServicesRoundedIcon />
            </Box>
            <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
              <Chip
                size="small"
                label="Servicio"
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'secondary.contrastText',
                  height: 22,
                  fontSize: '0.7rem',
                }}
              />
            </Box>
          </Box>
        )}

        {/* Texto */}
        <Box
          sx={{
            p: { xs: 1.25, sm: 1.5 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 0.5,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              whiteSpace: 'pre-line',
              fontWeight: 600,
              lineHeight: 1.3,
              minHeight: 36,
            }}
            title={descripcion}
          >
            {descFormateada}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ fontSize: '0.7rem' }}
          >
            #{id}
          </Typography>

          <Box
            sx={{
              mt: 0.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1 }}
            >
              Q {precio.toFixed(2)}
            </Typography>
            {!esServicio && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.7rem' }}
              >
                Stock: {cantidad}
              </Typography>
            )}
          </Box>
        </Box>
      </CardActionArea>

      {isAdmin && (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              gap: 0.5,
              zIndex: 2,
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                setEditOpen(true)
              }}
              sx={(theme) => ({
                bgcolor: alpha('#fff', 0.92),
                color: 'primary.main',
                width: 30,
                height: 30,
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                '&:hover': {
                  bgcolor: '#fff',
                  color: theme.palette.primary.dark,
                },
              })}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleDelete}
              disabled={deleting}
              sx={(theme) => ({
                bgcolor: alpha('#fff', 0.92),
                color: 'error.main',
                width: 30,
                height: 30,
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                '&:hover': {
                  bgcolor: '#fff',
                  color: theme.palette.error.dark,
                },
              })}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Dialog
            open={editOpen}
            onClose={() => setEditOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Editar producto</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField
                  label="SKU"
                  value={form.sku}
                  onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Descripción"
                  value={form.descripcion}
                  onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Costo"
                    type="number"
                    value={form.costo}
                    onChange={(e) => setForm((prev) => ({ ...prev, costo: e.target.value }))}
                    fullWidth
                  />
                  <TextField
                    label="Precio"
                    type="number"
                    value={form.precio}
                    onChange={(e) => setForm((prev) => ({ ...prev, precio: e.target.value }))}
                    fullWidth
                  />
                </Stack>
                <TextField
                  label="Cantidad"
                  type="number"
                  value={form.cantidad}
                  onChange={(e) => setForm((prev) => ({ ...prev, cantidad: e.target.value }))}
                  fullWidth
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
              >
                Guardar
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Card>
  )
}
