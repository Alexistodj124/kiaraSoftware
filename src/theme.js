// src/theme.js
import { createTheme, alpha } from '@mui/material/styles'

const BEIGE_BG = '#e0dacb'
const PAPER_BG = '#faf7f0'
const CHARCOAL = '#3d342b'
const DUSTY_ROSE = '#b07d6a'
const TEXT_PRIMARY = '#2b241e'
const TEXT_SECONDARY = '#6b5e52'
const DIVIDER = 'rgba(61, 52, 43, 0.12)'
const TABLE_HEAD_BG = '#efe9d9'

const softShadow =
  '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)'
const hoverShadow =
  '0 4px 8px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.08)'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: CHARCOAL,
      contrastText: '#ffffff',
    },
    secondary: {
      main: DUSTY_ROSE,
      contrastText: '#ffffff',
    },
    background: {
      default: BEIGE_BG,
      paper: PAPER_BG,
    },
    text: {
      primary: TEXT_PRIMARY,
      secondary: TEXT_SECONDARY,
    },
    divider: DIVIDER,
    success: { main: '#4f7a4f' },
    warning: { main: '#c08a3a' },
    error: { main: '#b3503e' },
    info: { main: '#5b7a8a' },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily:
      "'Poppins', 'Roboto', 'Helvetica Neue', Arial, system-ui, sans-serif",
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600, letterSpacing: '-0.005em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: BEIGE_BG,
          color: TEXT_PRIMARY,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '*::-webkit-scrollbar': {
          width: 10,
          height: 10,
        },
        '*::-webkit-scrollbar-thumb': {
          background: alpha(CHARCOAL, 0.18),
          borderRadius: 8,
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: alpha(CHARCOAL, 0.32),
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent',
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'default',
      },
      styleOverrides: {
        root: {
          backgroundColor: PAPER_BG,
          color: TEXT_PRIMARY,
          borderBottom: `1px solid ${DIVIDER}`,
          backdropFilter: 'saturate(160%)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: PAPER_BG,
          border: `1px solid ${DIVIDER}`,
          boxShadow: softShadow,
          transition:
            'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
          '&:hover': {
            boxShadow: hoverShadow,
            borderColor: alpha(CHARCOAL, 0.18),
          },
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        focusHighlight: {
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingLeft: 18,
          paddingRight: 18,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: alpha(CHARCOAL, 0.88),
          },
        },
        outlined: {
          borderColor: alpha(CHARCOAL, 0.32),
          '&:hover': {
            borderColor: CHARCOAL,
            backgroundColor: alpha(CHARCOAL, 0.04),
          },
        },
        sizeLarge: {
          paddingTop: 10,
          paddingBottom: 10,
          fontSize: '1rem',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: alpha('#ffffff', 0.5),
          '& fieldset': {
            borderColor: alpha(CHARCOAL, 0.18),
          },
          '&:hover fieldset': {
            borderColor: alpha(CHARCOAL, 0.36),
          },
          '&.Mui-focused fieldset': {
            borderColor: CHARCOAL,
            borderWidth: 1.5,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: TEXT_SECONDARY,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: TABLE_HEAD_BG,
          '& .MuiTableCell-head': {
            color: TEXT_PRIMARY,
            fontWeight: 600,
            fontSize: '0.8125rem',
            textTransform: 'none',
            letterSpacing: '0.02em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: DIVIDER,
        },
        head: {
          paddingTop: 12,
          paddingBottom: 12,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': {
            backgroundColor: alpha(CHARCOAL, 0.04),
          },
          '&.Mui-selected': {
            backgroundColor: alpha(DUSTY_ROSE, 0.12),
          },
          '&.Mui-selected:hover': {
            backgroundColor: alpha(DUSTY_ROSE, 0.18),
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: DIVIDER,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginLeft: 4,
          marginRight: 4,
          '&.Mui-selected': {
            backgroundColor: alpha(DUSTY_ROSE, 0.12),
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          paddingLeft: 4,
          paddingRight: 4,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: alpha(CHARCOAL, 0.92),
          fontSize: '0.75rem',
        },
      },
    },
  },
})

export default theme
