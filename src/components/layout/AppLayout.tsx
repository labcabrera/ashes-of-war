/**
 * AppLayout — root layout shell containing the header and page outlet.
 * Used as the layout route wrapper by react-router-dom.
 */
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

export default function AppLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader />
      <Box component="main" sx={{ flex: 1, p: 2 }}>
        <Outlet />
      </Box>
      <AppFooter />
    </Box>
  );
}
