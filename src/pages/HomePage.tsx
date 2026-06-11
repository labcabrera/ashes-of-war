/**
 * HomePage - landing page explaining the Ashes of War independent strategy game.
 */
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import GroupsIcon from '@mui/icons-material/Groups';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import ShieldIcon from '@mui/icons-material/Shield';
import TableRowsIcon from '@mui/icons-material/TableRows';
import type { SvgIconComponent } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { unitImageUrl } from '../utils/images';

const FEATURE_ICONS: SvgIconComponent[] = [ShieldIcon, TableRowsIcon, GroupsIcon];

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <Box sx={{ mx: { xs: -2, md: -2 }, mt: -2 }}>
      <Box
        sx={{
          minHeight: { xs: 340, md: 420 },
          display: 'flex',
          alignItems: 'flex-end',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.default',
          backgroundImage: {
            xs: 'linear-gradient(180deg, rgba(28,28,28,0.18) 0%, rgba(28,28,28,0.92) 66%, rgba(28,28,28,1) 100%), url("/images/units/german/german-panther-g.jpg")',
            md: 'linear-gradient(90deg, rgba(28,28,28,0.94) 0%, rgba(28,28,28,0.72) 43%, rgba(28,28,28,0.16) 100%), url("/images/units/german/german-panther-g.jpg")',
          },
          backgroundSize: 'cover',
          backgroundPosition: { xs: 'center top', md: 'center' },
        }}
      >
        <Container maxWidth="lg" sx={{ pb: { xs: 5, md: 7 }, pt: { xs: 16, md: 20 } }}>
          <Box sx={{ maxWidth: 760 }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
            </Stack>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', md: '5rem' },
                lineHeight: 0.95,
                fontWeight: 900,
                mb: 2,
              }}
            >
              {t('home.title')}
            </Typography>
            <Typography variant="h5" sx={{ maxWidth: 680, color: 'text.secondary', mb: 3 }}>
              {t('home.hero.lead')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button component={RouterLink} to="/rules/introduction" variant="contained" size="large" startIcon={<AutoStoriesIcon />}>
                {t('home.hero.primaryAction')}
              </Button>
              <Button component={RouterLink} to="/units" variant="contained" size="large" startIcon={<MilitaryTechIcon />}>
                {t('home.hero.secondaryAction')}
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
            mb: { xs: 5, md: 7 },
          }}
        >
          {[0, 1, 2].map((index) => {
            const Icon = FEATURE_ICONS[index] ?? ShieldIcon;
            return (
              <Paper key={index} sx={{ p: 2.5, height: '100%' }}>
                <Icon sx={{ color: 'secondary.main', fontSize: 34, mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  {t(`home.features.${index}.title`)}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t(`home.features.${index}.text`)}
                </Typography>
              </Paper>
            );
          })}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '0.9fr 1.1fr' },
            gap: { xs: 3, md: 4 },
            alignItems: 'center',
            mb: { xs: 5, md: 7 },
          }}
        >
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 650, mb: 2 }}>
              {t('home.indie.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {t('home.indie.text')}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
              gap: 1.5,
            }}
          >
            {([
              ['german', 'german-panzer-iv-g'],
              ['german', 'german-tiger-i'],
              ['soviet-union', 'soviet-union-t-34-85'],
              ['soviet-union', 'soviet-union-is-2'],
            ] as const).map(([factionId, unitId]) => (
              <Box
                key={unitId}
                component="img"
                src={unitImageUrl(factionId, unitId)}
                alt=""
                sx={{
                  width: '100%',
                  aspectRatio: '4 / 5',
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                }}
              />
            ))}
          </Box>
        </Box>

        <Paper sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' },
              gap: 3,
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                {t('home.next.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('home.next.text')}
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1.25}>
              <Button component={RouterLink} to="/army-builder" variant="contained">
                {t('home.next.armyBuilder')}
              </Button>
              <Button component={RouterLink} to="/wiki" variant="outlined">
                {t('home.next.wiki')}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
