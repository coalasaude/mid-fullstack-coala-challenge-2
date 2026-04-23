import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6F46BE',
      dark: '#5C39A0',
      light: '#8B6BD1',
    },
    secondary: {
      main: '#A98BDF',
    },
    background: {
      default: '#F7F4FC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F1732',
      secondary: '#5E5672',
    },
    success: { main: '#16A34A' },
    warning: { main: '#F59E0B' },
    error: { main: '#DC2626' },
    info: { main: '#6C8CFF' },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    h3: { fontWeight: 800, letterSpacing: -0.3 },
    h4: { fontWeight: 800, letterSpacing: -0.25 },
    h6: { fontWeight: 800, letterSpacing: -0.15 },
    subtitle1: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            'radial-gradient(circle at top left, rgba(111, 70, 190, 0.08), transparent 35%), #F7F4FC',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(111, 70, 190, 0.12)',
          boxShadow: '0 12px 28px rgba(40, 22, 71, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          borderColor: 'rgba(111, 70, 190, 0.15)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 700,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 800,
          color: '#1F1732',
          backgroundColor: 'rgba(111, 70, 190, 0.08)',
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
  },
});
