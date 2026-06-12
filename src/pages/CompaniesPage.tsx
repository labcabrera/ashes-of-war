/**
 * CompaniesPage lists static company templates with catalogue-style filters.
 */
import { useState } from 'react';
import { Box, Button, Drawer, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CompanyCard from '../components/companies/CompanyCard';
import CompanyFilterSidebar from '../components/companies/CompanyFilterSidebar';
import { useCompanyData } from '../hooks/useCompanyData';

export default function CompaniesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSidebarVisible = useMediaQuery(theme.breakpoints.up('md'));
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const {
    companies,
    filters,
    availableFactions,
    factionCounts,
    totalCount,
    setName,
    setFactions,
  } = useCompanyData();

  const sidebarProps = {
    name: filters.name,
    selectedFactions: filters.factions,
    availableFactions,
    factionCounts,
    totalCount,
    onNameChange: setName,
    onFactionsChange: setFactions,
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('companies.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {t('companies.subtitle')}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '260px 1fr' },
          alignItems: 'start',
          gap: 3,
        }}
      >
        {isSidebarVisible && <CompanyFilterSidebar {...sidebarProps} />}

        <Box>
          {!isSidebarVisible && (
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{ mb: 2 }}
            >
              {t('companies.sidebar.filters')}
            </Button>
          )}

          {!isSidebarVisible && (
            <Drawer anchor="left" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)}>
              <Box sx={{ width: 280, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">{t('companies.sidebar.filters')}</Typography>
                  <IconButton onClick={() => setFilterDrawerOpen(false)} aria-label={t('common.close')}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                <CompanyFilterSidebar {...sidebarProps} />
              </Box>
            </Drawer>
          )}

          {companies.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                gap: 2.5,
              }}
            >
              {companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onClick={() => navigate(`/companies/${encodeURIComponent(company.id)}`)}
                />
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
              {t('companies.noResults')}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
