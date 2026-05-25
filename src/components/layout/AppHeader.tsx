/**
 * AppHeader — top navigation bar with route links and language switcher.
 * Navigation: Home, Rules, Units, Army Builder, Campaign.
 * Language switcher persists selection to localStorage key "aow:i18n-locale".
 */
import { AppBar, Toolbar, Typography, Button, ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LOCALE_KEY } from '../../i18n';

const NAV_LINKS = [
  { to: '/', label: 'nav.home', end: true },
  { to: '/rules', label: 'nav.rules', end: false },
  { to: '/units', label: 'nav.units', end: false },
  { to: '/army-builder', label: 'nav.armyBuilder', end: false },
  { to: '/campaign', label: 'nav.campaign', end: false },
];

export default function AppHeader() {
  const { t, i18n } = useTranslation();

  const handleLanguage = (_: React.MouseEvent<HTMLElement>, newLang: string | null) => {
    if (!newLang) return;
    i18n.changeLanguage(newLang);
    localStorage.setItem(LOCALE_KEY, newLang);
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ mr: 2, fontWeight: 700, letterSpacing: 1 }}
        >
          AoW
        </Typography>

        {NAV_LINKS.map(({ to, label, end }) => (
          <Button
            key={to}
            component={NavLink}
            to={to}
            end={end}
            color="inherit"
            size="small"
            sx={{
              '&.active': {
                fontWeight: 700,
                borderBottom: '2px solid',
                borderColor: 'secondary.main',
              },
            }}
          >
            {t(label)}
          </Button>
        ))}

        <Box sx={{ flexGrow: 1 }} />

        <ToggleButtonGroup
          value={i18n.resolvedLanguage ?? 'en'}
          exclusive
          onChange={handleLanguage}
          size="small"
          aria-label={t('language.en')}
          sx={{ '& .MuiToggleButton-root': { color: 'inherit', border: 'none', py: 0.25, px: 1 } }}
        >
          <ToggleButton value="en">EN</ToggleButton>
          <ToggleButton value="es">ES</ToggleButton>
        </ToggleButtonGroup>
      </Toolbar>
    </AppBar>
  );
}
