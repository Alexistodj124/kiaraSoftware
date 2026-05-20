import * as React from 'react'
import {
  Box, Typography, TextField, Button, Stack, MenuItem,
  Paper, InputAdornment, Snackbar, Alert, Dialog,
  DialogTitle,
  DialogContent,
  DialogActions, IconButton,
  Divider
} from '@mui/material'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import AddIcon from '@mui/icons-material/Add'
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits'
import { alpha } from '@mui/material/styles'

import { API_BASE_URL } from '../config/api'

const tipo = [
  'Servicio',
  'Producto'
]

export default function NuevaCompra() {
  const [producto, setProducto] = React.useState({
    marcaId: 0,
    categoriaId: '',
    descripcion: '',
    costo: 0,
    precio: 0,
    cantidad: 0,
    imagen: '',
  })

  const [servicio, setServicio] = React.useState({
    descripcion: '',
    categoriaId: '',
    costo: 0,
    precio: 0,
    imagen: '',
  })

  const [preview, setPreview] = React.useState('')
  const [snack, setSnack] = React.useState({ open: false, msg: '', severity: 'success' })
  const [reqPoS, setReqPoS] = React.useState({tipo: ''})
  const [openNuevaCat, setOpenNuevaCat] = React.useState(false)
  const [nuevaCatNombre, setNuevaCatNombre] = React.useState('')
  const [nuevaCatDescripcion, setNuevaCatDescripcion] = React.useState('')
  const [categoriasProductos, setCategoriasProductos] = React.useState([])
  const [categoriasServicios, setCategoriasServicios] = React.useState([])

  const [marcasProductos, setMarcasProductos] = React.useState([])

  const [openNuevaMarca, setOpenNuevaMarca] = React.useState(false)
  const [nuevaMarcaNombre, setNuevaMarcaNombre] = React.useState('')
  const [nuevaMarcaDescripcion, setNuevaMarcaDescripcion] = React.useState('')

  const [openNuevoProducto, setOpenNuevoProducto] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [mensajeExito, setMensajeExito] = React.useState('')
  const [openSnackbarExito, setOpenSnackbarExito] = React.useState(false)
  const fileInputRef = React.useRef(null)





  const requiereproducto =
    reqPoS.tipo === 'Producto'

  const requiereservicio =
    reqPoS.tipo === 'Servicio'


  const handleCloseSnackbarExito = (_, reason) => {
    if (reason === 'clickaway') return
    setOpenSnackbarExito(false)
  }

  const cargarCategoriasProductos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categorias-productos`)
      if (!res.ok) throw new Error('Error al obtener categorías de productos')
      const data = await res.json()
      // data viene como array de objetos { id, nombre, descripcion, activo }
      setCategoriasProductos(data)
    } catch (err) {
      console.error(err)
    }
  }

  const cargarCategoriasServicios = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categorias-servicios`)
      if (!res.ok) throw new Error('Error al obtener categorías de servicios')
      const data = await res.json()
      setCategoriasServicios(data)
    } catch (err) {
      console.error(err)
    }
  }
  const cargarMarcasProductos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/marcas-productos`)
      if (!res.ok) throw new Error('Error al obtener marcas de productos')
      const data = await res.json()
      setMarcasProductos(data) // array de { id, nombre, descripcion, activo }
    } catch (err) {
      console.error(err)
    }
  }


  const handleOpenNuevaCat = () => {
    setNuevaCatNombre('')
    setNuevaCatDescripcion('')
    setOpenNuevaCat(true)
  }

  const handleCloseNuevaCat = () => {
    setOpenNuevaCat(false)
  }

  const handleGuardarNuevaCat = async () => {
    const nombre = nuevaCatNombre.trim()
    const descripcion = nuevaCatDescripcion.trim() || null

    if (!nombre) return

    try {
      if (reqPoS.tipo === 'Producto') {
        const res = await fetch(`${API_BASE_URL}/categorias-productos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nombre, descripcion }),
        })

        if (!res.ok) {
          const errText = await res.text()
          console.error('Error creando categoría de producto:', errText)
          return
        }

        await res.json() // por si quieres usar el id después

        // 🔁 Refrescar categorías desde el backend
        await cargarCategoriasProductos()

        // Seleccionar automáticamente la nueva categoría en el producto
        setProducto((p) => ({ ...p, categoria: nombre }))
      } else if (reqPoS.tipo === 'Servicio') {
        const res = await fetch(`${API_BASE_URL}/categorias-servicios`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nombre, descripcion }),
        })

        if (!res.ok) {
          const errText = await res.text()
          console.error('Error creando categoría de servicio:', errText)
          return
        }

        await res.json()

        // 🔁 Refrescar categorías de servicios
        await cargarCategoriasServicios()

        // Seleccionar automáticamente la nueva categoría en el servicio
        setServicio((s) => ({ ...s, categoria: nombre }))
      }

      setOpenNuevaCat(false)
    } catch (error) {
      console.error(error)
    }
  }
  const handleGuardarNuevaMarca = async () => {
    const nombre = nuevaMarcaNombre.trim()
    const descripcion = nuevaMarcaDescripcion.trim() || null

    if (!nombre) return

    try {
      const res = await fetch(`${API_BASE_URL}/marcas-productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, descripcion }),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error('Error creando marca de producto:', errText)
        return
      }

      await res.json() // por si quieres usar el id luego

      // 🔁 Refrescar marcas desde el backend
      await cargarMarcasProductos()

      // Seleccionar automáticamente la nueva marca en el producto
      setProducto((p) => ({ ...p, marcaId: nombre }))

      setOpenNuevaMarca(false)
    } catch (error) {
      console.error(error)
    }
  }


  React.useEffect(() => {
    cargarCategoriasProductos()
    cargarCategoriasServicios()
    cargarMarcasProductos()
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result)
        if (reqPoS.tipo === 'Servicio') {
          setServicio((prev) => ({ ...prev, imagen: reader.result }))
        } else {
          setProducto((prev) => ({ ...prev, imagen: reader.result }))
        }
      }
      reader.readAsDataURL(file)
    }
  }


  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMensajeExito('')

    try {
      if (reqPoS.tipo === 'Producto') {
        const body = {
          marca_id: Number(producto.marcaId),
          categoria_id: Number(producto.categoriaId),
          descripcion: producto.descripcion,
          costo: Number(producto.costo),
          precio: Number(producto.precio),
          cantidad: Number(producto.cantidad),
          imagen: producto.imagen || null,
        }

        const res = await fetch(`${API_BASE_URL}/productos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const errText = await res.text()
          console.error('Error backend:', errText)
          throw new Error('Error al crear producto')
        }

        const data = await res.json()
        console.log('Producto creado:', data)

        // 🔹 limpiar formulario
        const initialProducto = {
          marcaId: '',
          categoriaId: '',
          descripcion: '',
          costo: 0,
          precio: 0,
          cantidad: 0,
          imagen: '',
        }
        setProducto(initialProducto)

        setPreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        // 🔹 cerrar dialog
        // 🔹 mostrar mensaje de éxito (puede ser snackbar o algo simple)
        setMensajeExito('Producto creado exitosamente')
        setOpenSnackbarExito(true)
      }else if (reqPoS.tipo === 'Servicio') {
      const body = {
        categoria_id: Number(servicio.categoriaId),
        descripcion: servicio.descripcion,
        costo: Number(servicio.costo),
        precio: Number(servicio.precio),
        imagen: servicio.imagen || null,
      }

      const res = await fetch(`${API_BASE_URL}/servicios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error('Error backend:', errText)
        throw new Error('Error al crear servicio')
      }

      const data = await res.json()
      console.log('Servicio:', body)
      console.log('Servicio creado:', data)

      const initialServicio = {
        descripcion: '',
        categoriaId: '',
        costo: 0,
        precio: 0,
        imagen: '',
      }
      setServicio(initialServicio)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // 🔹 mensaje de éxito
      setMensajeExito('Servicio creado correctamente')
      setOpenSnackbarExito(true)
    }

    } catch (err) {
      console.error(err)
      alert('Ocurrió un error al guardar. Revisa consola.') // o snackbar de error
    } finally {
      setLoading(false)
    }
  }

  const renderImagePicker = () => (
    <Box sx={{ textAlign: 'center', py: 1 }}>
      {preview ? (
        <Box
          component="img"
          src={preview}
          alt="Vista previa"
          sx={{
            width: { xs: 160, sm: 200 },
            height: { xs: 160, sm: 200 },
            objectFit: 'cover',
            borderRadius: 3,
            mb: 1.5,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            mx: 'auto',
          }}
        />
      ) : (
        <Box
          sx={{
            width: { xs: 160, sm: 200 },
            height: { xs: 160, sm: 200 },
            display: 'grid',
            placeItems: 'center',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
            border: (theme) => `2px dashed ${alpha(theme.palette.primary.main, 0.18)}`,
            borderRadius: 3,
            mx: 'auto',
            mb: 1.5,
            color: 'text.secondary',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <AddPhotoAlternateIcon sx={{ fontSize: 40, opacity: 0.5 }} />
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
              Sin imagen
            </Typography>
          </Box>
        </Box>
      )}
      <Button variant="outlined" component="label" size="small">
        Subir imagen
        <input
          hidden
          accept="image/*"
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
      </Button>
    </Box>
  )

  return (
    <Box sx={{ maxWidth: { xs: '100%', md: 760 }, mx: 'auto', mt: { xs: 1, md: 2 } }}>
      <Paper sx={{ p: { xs: 2.5, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box
            sx={(theme) => ({
              width: 42,
              height: 42,
              borderRadius: 12 / 8,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            })}
          >
            <ProductionQuantityLimitsIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Agregar nuevo producto
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crea un nuevo producto o servicio para el catálogo
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.25}>

            <TextField
              select
              label="Servicio o Producto"
              fullWidth
              required
              value={reqPoS.tipo}
              onChange={(e) => setReqPoS((p) => ({ ...p, tipo: e.target.value }))}
            >
              {tipo.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>

            {/* Imagen */}
            {requiereproducto && renderImagePicker()}
            {requiereservicio && renderImagePicker()}

            {/* Nombre */}
            {requiereproducto && (
              <Box display="flex" gap={1}>
                <TextField
                  select
                  label="Marca"
                  fullWidth
                  required
                  value={producto.marcaId}
                  onChange={(e) =>
                    setProducto((p) => ({ ...p, marcaId: e.target.value }))
                  }
                >
                  {marcasProductos.map((marca) => (
                    <MenuItem key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </MenuItem>
                  ))}
                </TextField>

                <IconButton
                  color="primary"
                  aria-label="Agregar marca"
                  onClick={() => {
                    setNuevaMarcaNombre('')
                    setNuevaMarcaDescripcion('')
                    setOpenNuevaMarca(true)
                  }}
                  sx={(theme) => ({
                    flexShrink: 0,
                    alignSelf: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.16) },
                  })}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            )}


            {/* Descripción */}
            {requiereproducto && (
              <TextField
                label="Descripción"
                multiline
                minRows={3}
                fullWidth
                value={producto.descripcion}
                onChange={(e) => setProducto((p) => ({ ...p, descripcion: e.target.value }))}
              />
            )}

            {requiereservicio && (
              <TextField
                label="Descripción"
                multiline
                minRows={3}
                fullWidth
                value={servicio.descripcion}
                onChange={(e) => setServicio((p) => ({ ...p, descripcion: e.target.value }))}
              />
            )}

            {/* Categoría */}
            {requiereproducto && (
              <Box display="flex" gap={1}>
                <TextField
                  select
                  label="Categoría"
                  fullWidth
                  required
                  value={producto.categoriaId}
                  onChange={(e) =>
                    setProducto((p) => ({ ...p, categoriaId: e.target.value }))
                  }
                >
                  {categoriasProductos.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </MenuItem>
                  ))}
                </TextField>

                <IconButton
                  color="primary"
                  aria-label="Agregar categoría"
                  onClick={handleOpenNuevaCat}
                  sx={(theme) => ({
                    flexShrink: 0,
                    alignSelf: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.16) },
                  })}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            )}

            {requiereservicio && (
              <Box display="flex" gap={1}>
                <TextField
                  select
                  label="Categoría"
                  fullWidth
                  required
                  value={servicio.categoriaId}
                  onChange={(e) =>
                    setServicio((p) => ({ ...p, categoriaId: e.target.value }))
                  }
                >
                  {categoriasServicios.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </MenuItem>
                  ))}
                </TextField>

                <IconButton
                  color="primary"
                  aria-label="Agregar categoría"
                  onClick={handleOpenNuevaCat}
                  sx={(theme) => ({
                    flexShrink: 0,
                    alignSelf: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.16) },
                  })}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            )}

            {/* Costo + Precio + Cantidad (responsive) */}
            {requiereproducto && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Costo (Q)"
                  type="number"
                  required
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">Q</InputAdornment> }}
                  value={producto.costo}
                  onChange={(e) => setProducto((p) => ({ ...p, costo: e.target.value }))}
                />
                <TextField
                  label="Precio (Q)"
                  type="number"
                  required
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">Q</InputAdornment> }}
                  value={producto.precio}
                  onChange={(e) => setProducto((p) => ({ ...p, precio: e.target.value }))}
                />
                <TextField
                  label="Cantidad"
                  type="number"
                  fullWidth
                  value={producto.cantidad}
                  onChange={(e) => setProducto((p) => ({ ...p, cantidad: e.target.value }))}
                />
              </Stack>
            )}

            {requiereservicio && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Costo (Q)"
                  type="number"
                  required
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">Q</InputAdornment> }}
                  value={servicio.costo}
                  onChange={(e) => setServicio((p) => ({ ...p, costo: e.target.value }))}
                />
                <TextField
                  label="Precio (Q)"
                  type="number"
                  required
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">Q</InputAdornment> }}
                  value={servicio.precio}
                  onChange={(e) => setServicio((p) => ({ ...p, precio: e.target.value }))}
                />
              </Stack>
            )}

            <Button
              variant="contained"
              color="primary"
              type="submit"
              size="large"
              fullWidth
              sx={{ py: 1.25, mt: 1 }}
              disabled={loading}
            >
              {loading ? 'Guardando…' : 'Guardar'}
            </Button>
          </Stack>
        </form>
        <Dialog open={openNuevaCat} onClose={handleCloseNuevaCat} fullWidth maxWidth="sm">
          <DialogTitle>Nueva categoría de producto</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre de la categoría"
              value={nuevaCatNombre}
              onChange={(e) => setNuevaCatNombre(e.target.value)}
              autoFocus
              required
            />
            <TextField
              label="Descripción (opcional)"
              value={nuevaCatDescripcion}
              onChange={(e) => setNuevaCatDescripcion(e.target.value)}
              multiline
              minRows={2}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseNuevaCat}>Cancelar</Button>
            <Button variant="contained" onClick={handleGuardarNuevaCat}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openNuevaMarca}
          onClose={() => setOpenNuevaMarca(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Nueva marca de producto</DialogTitle>
          <DialogContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
          >
            <TextField
              label="Nombre de la marca"
              value={nuevaMarcaNombre}
              onChange={(e) => setNuevaMarcaNombre(e.target.value)}
              autoFocus
              required
            />
            <TextField
              label="Descripción (opcional)"
              value={nuevaMarcaDescripcion}
              onChange={(e) => setNuevaMarcaDescripcion(e.target.value)}
              multiline
              minRows={2}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenNuevaMarca(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleGuardarNuevaMarca}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
      <Snackbar
        open={openSnackbarExito}
        autoHideDuration={3000}
        onClose={handleCloseSnackbarExito}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbarExito}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {mensajeExito}
        </Alert>
      </Snackbar>



    </Box>
  )
}
