import * as React from 'react'
import { Card, CardActionArea, Box, Typography, Chip } from '@mui/material'

export default function ProductCard({ product, onClick }) {
  const { name, sku, price, stock, image } = product
  const low = stock <= 5

  return (
    <Card sx={{ borderRadius: 3, height: '100%' }} elevation={3}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        {/* Contenedor CUADRADO para mantener tamaño uniforme */}
        <Box sx={{ aspectRatio: '1 / 1', display: 'grid', gridTemplateRows: '3fr 2fr' }}>

          {/* Imagen / placeholder */}
          <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden', borderBottom: 1, borderColor: 'divider' }}>
            {image ? (
              <Box
                component="img"
                alt={name}
                src={image}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Box sx={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', bgcolor: 'action.hover' }}>
                <Typography variant="overline" color="text.secondary">Sin imagen</Typography>
              </Box>
            )}
            <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
              <Chip size="small" label={low ? 'Bajo stock' : 'En stock'} color={low ? 'warning' : 'success'} />
            </Box>
          </Box>

          {/* Texto */}
          <Box sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" noWrap title={name}>{name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{sku}</Typography>
            <Box sx={{ mt: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Q {price.toFixed(2)}</Typography>
              <Typography variant="caption" color="text.secondary">Stock: {stock}</Typography>
            </Box>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  )
}
