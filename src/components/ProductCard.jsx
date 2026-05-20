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
        height: '100%',
        minWidth: 0,
        maxWidth: '100%',
        minHeight: 390,
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
              aspectRatio: '3 / 4',
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
          // Encabezado compacto para servicios (sin foto)
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 6,
              background: (theme) =>
                `linear-gradient(90deg, ${theme.palette.secondary.main}, ${alpha(theme.palette.secondary.main, 0.55)})`,
            }}
          />
        )}

        {/* Texto */}
        {esServicio ? (
          <Box
            sx={{
              px: { xs: 1.5, sm: 1.75 },
              pt: isAdmin ? 5 : { xs: 1.5, sm: 1.75 },
              pb: { xs: 1.5, sm: 1.75 },
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Chip
                size="small"
                icon={
                  <DesignServicesRoundedIcon sx={{ fontSize: 14 }} />
                }
                label="Servicio"
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.14),
                  color: 'secondary.main',
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.secondary.main, 0.25)}`,
                  '& .MuiChip-icon': {
                    color: 'secondary.main',
                    ml: 0.5,
                  },
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.7rem' }}
              >
                #{id}
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 0,
                overflow: 'hidden',
                px: 0.5,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.25,
                  textAlign: 'center',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  fontSize: (() => {
                    const len = (descripcion || '').length
                    if (len <= 12) return '1.3rem'
                    if (len <= 22) return '1.15rem'
                    if (len <= 35) return '1rem'
                    return '0.9rem'
                  })(),
                }}
                title={descripcion}
              >
                {descripcion}
              </Typography>
            </Box>

            <Box sx={{ mt: 'auto', pt: 0.5 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  lineHeight: 1,
                  fontSize: { xs: '1.05rem', sm: '1.15rem' },
                }}
              >
                Q {precio.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        ) : (
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
                fontWeight: 600,
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minHeight: 36,
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
              title={descripcion}
            >
              {descripcion}
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
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.7rem' }}
              >
                Stock: {cantidad}
              </Typography>
            </Box>
          </Box>
        )}
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
