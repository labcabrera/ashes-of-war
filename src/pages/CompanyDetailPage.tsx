/**
 * CompanyDetailPage renders one static company template.
 */
import { Box, Button, Chip, Container, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CompanyStructure from '../components/companies/CompanyStructure';
import { allCompanies } from '../data/companies';
import { factionFlagUrl, unitTypeIconUrl } from '../utils/images';
import { useDisplaySettings } from '../hooks/useDisplaySettings';

export default function CompanyDetailPage() {
  const { t } = useTranslation();
  const { unitTypeIconStyle } = useDisplaySettings();
  const { companyId } = useParams();
  const company = allCompanies.find((entry) => entry.id === companyId);

  if (!company) {
    return (
      <Container maxWidth="md">
        <Button component={RouterLink} to="/companies" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          {t('companies.back')}
        </Button>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('companies.notFound')}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Button component={RouterLink} to="/companies" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        {t('companies.back')}
      </Button>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
          <Box
            component="img"
            src={unitTypeIconUrl(company.classification, unitTypeIconStyle)}
            alt=""
            aria-hidden="true"
            sx={{
              width: 92,
              height: 92,
              objectFit: 'contain',
              borderRadius: 1,
              bgcolor: 'rgba(10, 12, 10, 0.68)',
              border: '1px solid',
              borderColor: 'divider',
              p: 1,
            }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {company.name}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 1 }}>
              <Chip
                avatar={
                  <Box
                    component="img"
                    src={factionFlagUrl(company.faction)}
                    alt=""
                    aria-hidden="true"
                    sx={{ objectFit: 'cover' }}
                  />
                }
                label={t(`factions.${company.faction}`)}
              />
              <Chip label={t(`units.types.${company.classification}`)} color="secondary" />
            </Stack>
          </Box>
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {company.description}
        </Typography>
      </Paper>

      <CompanyStructure company={company} />
    </Container>
  );
}
