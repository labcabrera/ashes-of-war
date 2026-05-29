/**
 * MUI theme configuration for Ashes of War.
 * Dark theme with olive primary (#4a5e3a) and khaki secondary (#c8a96e).
 */
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#85a56c',
    },
    secondary: {
      main: '#c8a96e',
    },
    background: {
      default: '#1c1c1c',
      paper: '#2a2a2a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16,
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.95rem',
      lineHeight: 1.65,
    },
    button: {
      fontSize: '0.95rem',
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          fontSize: '17px',
        },
      },
    },
  },
});

export default theme;
