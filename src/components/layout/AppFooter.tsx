/**
 * AppFooter - global project, legal, and community information footer.
 */
import { Box, Button, Container, Divider, Link, Stack, Typography } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const INTERNAL_LINKS = [
  { to: '/rules', label: 'footer.links.rules' },
  { to: '/units', label: 'footer.links.units' },
  { to: '/army-builder', label: 'footer.links.armyBuilder' },
  { to: '/wiki', label: 'footer.links.wiki' },
];

const REPOSITORY_URL = 'https://github.com/labcabrera/ashes-of-war';

export default function AppFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        mt: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr 1fr' },
            gap: { xs: 3, md: 4 },
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              {t('footer.project.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {t('footer.project.description')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('footer.project.nonProfit')}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              {t('footer.links.title')}
            </Typography>
            <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
              {INTERNAL_LINKS.map((link) => (
                <Button
                  key={link.to}
                  component={RouterLink}
                  to={link.to}
                  size="small"
                  sx={{ justifyContent: 'flex-start', px: 0, textTransform: 'none' }}
                >
                  {t(link.label)}
                </Button>
              ))}
              <Button
                component={Link}
                href={REPOSITORY_URL}
                target="_blank"
                rel="noreferrer"
                size="small"
                startIcon={<GitHubIcon fontSize="small" />}
                sx={{ justifyContent: 'flex-start', px: 0, textTransform: 'none' }}
              >
                {t('footer.links.source')}
              </Button>
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              {t('footer.legal.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('footer.legal.disclaimer')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('footer.legal.historical')}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            {t('footer.about')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('footer.copyright', { year })}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
