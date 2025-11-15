import * as React from 'react'
import {
  Box, Typography, TextField, Button, Stack, MenuItem,
  Paper, InputAdornment, Snackbar, Alert
} from '@mui/material'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'

const categorias = [
  'Cabello',
  'Uñas',
  'Pedicure',
  'Manicure',
  'Otros',
]

const tipo = [
  'Servicio',
  'Producto'
]

export default function NuevaCompra() {
  const [producto, setProducto] = React.useState({
    marca: '',
    descripcion: '',
    categoria: '',
    costo: 0,
    precio: 0,
    cantidad: 0,
    imagen: '',
  })

  const [servicio, setServicio] = React.useState({
    descripcion: '',
    categoria: '',
    costo: 0,
    precio: 0,
    imagen: '',
  })

  const [preview, setPreview] = React.useState('')
  const [snack, setSnack] = React.useState({ open: false, msg: '', severity: 'success' })
  const [reqPoS, setReqPoS] = React.useState({tipo: ''})

  const requiereproducto =
    reqPoS.tipo === 'Producto'

  const requiereservicio =
    reqPoS.tipo === 'Servicio'

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result)
        if (reqPoS.tipo === 'Servicio') {
          setServicio((prev) => ({ ...prev, imagen: reader.result }))
          return
        }else{
          setProducto((prev) => ({ ...prev, imagen: reader.result }))
          return
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!producto.nombre || !producto.precio || !producto.categoria) {
      setSnack({ open: true, msg: 'Por favor completa los campos obligatorios', severity: 'warning' })
      return
    }

    console.log('Nuevo producto:', producto)
    setSnack({ open: true, msg: 'Producto agregado correctamente ✅', severity: 'success' })

    // Aquí podrías enviar los datos a tu API o guardarlos en Firestore
    setProducto({
      nombre: '',
      descripcion: '',
      categoria: '',
      precio: '',
      cantidad: '',
      imagen: '',
    })
    setPreview('')
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Agregar nuevo producto
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>

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
            {requiereproducto && (
            <Box sx={{ textAlign: 'center' }}>
              {preview ? (
                <Box
                  component="img"
                  src={preview}
                  alt="Vista previa"
                  sx={{
                    width: 200,
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 1,
                    border: '2px solid #444',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  <AddPhotoAlternateIcon fontSize="large" color="action" />
                </Box>
              )}
              <Button variant="outlined" component="label">
                Subir imagen
                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
              </Button>
            </Box>
            )}
            {requiereservicio && (
            <Box sx={{ textAlign: 'center' }}>
              {preview ? (
                <Box
                  component="img"
                  src={preview}
                  alt="Vista previa"
                  sx={{
                    width: 200,
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 1,
                    border: '2px solid #444',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  <AddPhotoAlternateIcon fontSize="large" color="action" />
                </Box>
              )}
              <Button variant="outlined" component="label">
                Subir imagen
                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
              </Button>
            </Box>
            )}

            

            {/* Nombre */}
            {requiereproducto && (
              <TextField
                label="Marca"
                fullWidth
                required
                value={producto.marca}
                onChange={(e) => setProducto((p) => ({ ...p, nombre: e.target.value }))}
              />
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
              <TextField
                select
                label="Categoría"
                fullWidth
                required
                value={producto.categoria}
                onChange={(e) => setProducto((p) => ({ ...p, categoria: e.target.value }))}
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>
            )}
            {requiereservicio && (
              <TextField
                select
                label="Categoría"
                fullWidth
                required
                value={servicio.categoria}
                onChange={(e) => setServicio((p) => ({ ...p, categoria: e.target.value }))}
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>
            )}

            {/* Cossto */}
            {requiereproducto && (
              <TextField
                label="Costo (Q)"
                type="number"
                required
                InputProps={{ startAdornment: <InputAdornment position="start">Q</InputAdornment> }}
                value={producto.costo}
                onChange={(e) => setProducto((p) => ({ ...p, costo: e.target.value }))}
              />
            )}
            {requiereservicio && (
              <TextField
                label="Costo (Q)"
                type="number"
                required
                InputProps={{ startAdornment: <InputAdornment position="start">Q</InputAdornment> }}
                value={servicio.costo}
                onChange={(e) => setServicio((p) => ({ ...p, costo: e.target.value }))}
              />
            )}

            {/* Precio */}
            {requiereproducto && (
              <TextField
                label="Precio (Q)"
                type="number"
                required
                InputProps={{ startAdornment: <InputAdornment position="start">Q</InputAdornment> }}
                value={producto.precio}
                onChange={(e) => setProducto((p) => ({ ...p, precio: e.target.value }))}
              />
            )}

            {requiereservicio && (
              <TextField
                label="Precio (Q)"
                type="number"
                required
                InputProps={{ startAdornment: <InputAdornment position="start">Q</InputAdornment> }}
                value={servicio.precio}
                onChange={(e) => setServicio((p) => ({ ...p, precio: e.target.value }))}
              />
            )}

            {/* Cantidad */}
            {requiereproducto && (
              <TextField
                label="Cantidad"
                type="number"
                fullWidth
                value={producto.cantidad}
                onChange={(e) => setProducto((p) => ({ ...p, cantidad: e.target.value }))}
              />
            )}

            <Button variant="contained" color="primary" type="submit">
              Guardar producto
            </Button>
          </Stack>
        </form>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  )
}
