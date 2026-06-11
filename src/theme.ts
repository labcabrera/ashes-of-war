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
      main:          '#53606a',
      light:         '#7d8b93',
      dark:          '#303941',
      contrastText:  '#edf0ec',
    },

    secondary: {
      main:          '#9fb0aa',
      light:         '#c2cbc5',
      dark:          '#6f817b',
      contrastText:  '#11161a',
    },

    error: {
      main:          '#9a3732',
      light:         '#c86d68',
      dark:          '#68201d',
      contrastText:  '#f5eded',
    },

    background: {
      default:       '#0d1115',
      paper:         '#171d22',
    },

    text: {
      primary:       '#d4d7d0',
      secondary:     '#9aa29b',
      disabled:      '#59625d',
    },

    divider:         '#2f3941',

    action: {
      active:        '#c2cbc5',
      hover:         'rgba(125, 139, 147, 0.14)',
      selected:      'rgba(159, 176, 170, 0.16)',
      disabledBackground: '#171d22',
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
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0d1115',
          backgroundImage:
            'linear-gradient(180deg, rgba(83,96,106,0.08), rgba(13,17,21,0) 260px),'
            + 'repeating-linear-gradient(0deg, rgba(237,240,236,0.015) 0, rgba(237,240,236,0.015) 1px, transparent 1px, transparent 4px)',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#171b20',
          backgroundImage: 'linear-gradient(180deg, #20262d 0%, #15191e 100%)',
          borderTop: '1px solid #53606a',
          borderBottom: '2px solid #303941',
          boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#171d22',
          backgroundImage: 'linear-gradient(180deg, rgba(83,96,106,0.16), rgba(83,96,106,0.03))',
          border: '1px solid #303941',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#171d22',
          border: '1px solid #303941',
          backgroundImage: 'linear-gradient(180deg, rgba(83,96,106,0.14), rgba(17,22,26,0.02))',
          paddingTop: '2px',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 3, letterSpacing: '0.06em',
                // fontFamily: '"Share Tech Mono", monospace',
                fontSize: '0.7rem' },
        colorPrimary:   { backgroundColor: '#1b252c', color: '#9fb0aa',
                          border: '1px solid #3d4b52' },
        colorSecondary: { backgroundColor: '#202824', color: '#c2cbc5',
                          border: '1px solid #53605a' },
        colorError:     { backgroundColor: '#2a1717', color: '#c86d68',
                          border: '1px solid #68201d' },
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
      styleOverrides: { root: { borderColor: '#303941' } },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: '#11161a', border: '1px solid #303941',
                   color: '#d4d7d0',
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
