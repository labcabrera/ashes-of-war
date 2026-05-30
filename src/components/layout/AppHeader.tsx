/**
 * AppHeader — top navigation bar with route links and language switcher.
 * Navigation: Rules, Units, Army Builder, Campaign, Wiki.
 * The "AoW" title links to the home page.
 * Language switcher persists selection to localStorage key "aow:i18n-locale".
 */
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Stack,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LanguageIcon from '@mui/icons-material/Language';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LOCALE_KEY } from '../../i18n';

const NAV_LINKS = [
  { to: '/rules/introduction', label: 'nav.rules', end: false },
  { to: '/units', label: 'nav.units', end: false },
  { to: '/army-builder', label: 'nav.armyBuilder', end: false },
  { to: '/campaign', label: 'nav.campaign', end: false },
  { to: '/wiki', label: 'nav.wiki', end: false },
];

export default function AppHeader() {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null);

  const handleLanguage = (newLang: string) => {
    i18n.changeLanguage(newLang);
    localStorage.setItem(LOCALE_KEY, newLang);
    setLanguageAnchor(null);
  };

  const navButtonSx = {
    justifyContent: 'flex-start',
    '&.active': {
      fontWeight: 700,
      borderBottom: '2px solid',
      borderColor: 'secondary.main',
    },
  };

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: 1, minHeight: { xs: 58, sm: 64 } }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => setMobileMenuOpen(true)}
          aria-label={t('nav.menu')}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component={NavLink}
          to="/"
          sx={{
            mr: { xs: 0.5, md: 2 },
            fontWeight: 700,
            letterSpacing: 1,
            color: 'inherit',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          AoW
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
          {NAV_LINKS.map(({ to, label, end }) => (
            <Button
              key={to}
              component={NavLink}
              to={to}
              end={end}
              color="inherit"
              size="small"
              sx={navButtonSx}
            >
              {t(label)}
            </Button>
          ))}
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton
          color="inherit"
          onClick={(event) => setLanguageAnchor(event.currentTarget)}
          aria-label={t('language.select')}
          aria-controls={languageAnchor ? 'language-menu' : undefined}
          aria-haspopup="menu"
          aria-expanded={languageAnchor ? 'true' : undefined}
        >
          <LanguageIcon />
          <Typography component="span" sx={{ ml: 0.75, fontSize: '0.82rem', fontWeight: 700 }}>
            {(i18n.resolvedLanguage ?? 'en').toUpperCase()}
          </Typography>
        </IconButton>
        <Menu
          id="language-menu"
          anchorEl={languageAnchor}
          open={Boolean(languageAnchor)}
          onClose={() => setLanguageAnchor(null)}
        >
          <MenuItem selected={(i18n.resolvedLanguage ?? 'en') === 'en'} onClick={() => handleLanguage('en')}>
            {t('language.en')}
          </MenuItem>
          <MenuItem selected={(i18n.resolvedLanguage ?? 'en') === 'es'} onClick={() => handleLanguage('es')}>
            {t('language.es')}
          </MenuItem>
        </Menu>
      </Toolbar>
      <Drawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <Box sx={{ width: 290, pt: 1 }} role="navigation" aria-label={t('nav.menu')}>
          <Typography variant="h6" sx={{ px: 2, py: 1, fontWeight: 700 }}>
            AoW
          </Typography>
          <List>
            {NAV_LINKS.map(({ to, label, end }) => (
              <ListItemButton
                key={to}
                component={NavLink}
                to={to}
                end={end}
                onClick={() => setMobileMenuOpen(false)}
                sx={{
                  '&.active': {
                    bgcolor: 'action.selected',
                    color: 'secondary.main',
                  },
                }}
              >
                <ListItemText primary={t(label)} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
