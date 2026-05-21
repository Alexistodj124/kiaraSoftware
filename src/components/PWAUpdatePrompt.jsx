import { useRegisterSW } from 'virtual:pwa-register/react'
import { Snackbar, Alert, Button, Stack } from '@mui/material'

export default function PWAUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null

  return (
    <Snackbar
      open={offlineReady || needRefresh}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      onClose={close}
    >
      <Alert
        severity={needRefresh ? 'info' : 'success'}
        onClose={close}
        action={
          needRefresh ? (
            <Stack direction="row" spacing={1}>
              <Button
                color="inherit"
                size="small"
                onClick={() => updateServiceWorker(true)}
              >
                Recargar
              </Button>
              <Button color="inherit" size="small" onClick={close}>
                Cerrar
              </Button>
            </Stack>
          ) : null
        }
        sx={{ width: '100%' }}
      >
        {needRefresh
          ? 'Hay una nueva versión disponible.'
          : 'App lista para usarse sin conexión.'}
      </Alert>
    </Snackbar>
  )
}
