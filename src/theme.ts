/**
 * MUI theme configuration for Ashes of War.
 * Dark theme with olive primary (#4a5e3a) and khaki secondary (#c8a96e).
 */
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4a5e3a',
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
  },
});

export default theme;
