import { createTheme } from '@mui/material/styles';

// const Wehrmacht = {
//   feldgrau:  { 50: '#f0ede8', 100: '#d8d3ca', 200: '#b8b2a5',
//                400: '#7a7568', 600: '#4b5058', 800: '#2b2f35',
//                900: '#14161a' },
//   sandgelb:  { 50: '#faf6ea', 100: '#ecdfa8', 200: '#d8c270',
//                400: '#c8a84b', 600: '#a07830', 800: '#705018',
//                900: '#3a2808' },
//   blutrot:   { 50: '#f8eaea', 100: '#e8b8b8', 200: '#c87070',
//                400: '#a83838', 600: '#8a2020', 800: '#601010',
//                900: '#380808' },
// };

const theme = createTheme({
  palette: {
    mode: 'dark',

    primary: {
      main:          '#4b5058',  // Feldgrau 600
      light:         '#7a7568',  // Feldgrau 400
      dark:          '#2b2f35',  // Dunkelgrau
      contrastText:  '#f0ede8',  // Feldgrau 50
    },

    secondary: {
      main:          '#c8a84b',  // Sandgelb 400 — acento dorado
      light:         '#d8c270',  // Sandgelb 200
      dark:          '#a07830',  // Sandgelb 600
      contrastText:  '#3a2808',  // Sandgelb 900
    },

    error: {
      main:          '#8a2020',  // Blutrot 600
      light:         '#c87070',
      dark:          '#601010',
      contrastText:  '#f8eaea',
    },

    background: {
      default:       '#14161a',  // Schwarz — página
      paper:         '#1e2228',  // Dunkelgrau suave — cards
    },

    text: {
      primary:       '#c4bba8',  // Khaki hell — texto principal
      secondary:     '#7a7568',  // Feldgrau 400 — texto muted
      disabled:      '#3a3830',
    },

    divider:         '#2b2f35',  // Dunkelgrau

    action: {
      active:        '#c4bba8',
      hover:         'rgba(75, 80, 88, 0.12)',
      selected:      'rgba(200, 168, 75, 0.16)',
      disabledBackground: '#1e2228',
    },
  },

  typography: {
    // fontFamily: '"Share Tech Mono", "Courier New", monospace',
    // h1: { fontFamily: '"Oswald", "Arial Narrow", sans-serif',
    //       letterSpacing: '0.15em', fontWeight: 700 },
    // h2: { fontFamily: '"Oswald", "Arial Narrow", sans-serif',
    //       letterSpacing: '0.12em', fontWeight: 600 },
    // h3: { fontFamily: '"Oswald", "Arial Narrow", sans-serif',
    //       letterSpacing: '0.10em' },
    // body1:   { letterSpacing: '0.02em' },
    // caption:  { fontFamily: '"Share Tech Mono", monospace',
    //             letterSpacing: '0.08em' },
  },

  shape: { borderRadius: 3 },  // esquinas cuadradas estilo militar

  components: {
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#0f1114',
                borderBottom: '2px solid #2b2f35' },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: { backgroundColor: '#1a1c20',
                border: '1px solid #2b2f35',
                // dashed top accent via backgroundImage:
                backgroundImage: 'repeating-linear-gradient(90deg,'
                  + '#c8a84b 0,#c8a84b 8px,transparent 8px,transparent 14px)'
                  + ',none',
                backgroundSize: '100% 2px',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'top',
                paddingTop: '2px' },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 3, letterSpacing: '0.06em',
                // fontFamily: '"Share Tech Mono", monospace',
                fontSize: '0.7rem' },
        colorPrimary:   { backgroundColor: '#1e2a38', color: '#6090c0',
                          border: '1px solid #2a4058' },
        colorSecondary: { backgroundColor: '#281e10', color: '#c8a84b',
                          border: '1px solid #503810' },
        colorError:     { backgroundColor: '#280e0e', color: '#c07070',
                          border: '1px solid #4a1818' },
      },
    },

    MuiButton: {
      styleOverrides: {
        // containedPrimary:   { backgroundColor: '#4b5058', color: '#f0ede8',
        //                       '&:hover': { backgroundColor: '#5a6068' } },
        // containedSecondary: { backgroundColor: '#c8a84b', color: '#3a2808',
        //                       fontWeight: 700,
        //                       '&:hover': { backgroundColor: '#d8b85b' } },
      },
    },

    MuiDivider: {
      styleOverrides: { root: { borderColor: '#2b2f35' } },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: '#0f1114', border: '1px solid #2b2f35',
                   color: '#c4bba8',
                  //  fontFamily: '"Share Tech Mono", monospace',
                   fontSize: '0.7rem', letterSpacing: '0.05em' },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: { '&:hover': { backgroundColor: 'rgba(75,80,88,0.1)' } },
      },
    },
  },
});

export default theme;