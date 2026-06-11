/**
 * UnitsPage - tabbed unit and weapon catalogue with card/table views and detail panels.
 */
import { useState, useMemo } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Pagination,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

const UNITS_PER_PAGE = 48;

import CloseIcon from '@mui/icons-material/Close';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUnitData } from '../hooks/useUnitData';
import UnitFilterSidebar from '../components/units/UnitFilterSidebar';
import UnitFilterChips from '../components/units/UnitFilterChips';
import UnitList from '../components/units/UnitList';
import WeaponList from '../components/weapons/WeaponList';
import WeaponDetail from '../components/weapons/WeaponDetail';
import WeaponFilters from '../components/weapons/WeaponFilters';
import { Unit } from '../types/unit';
import { Weapon } from '../types/weapon';
import type { FactionId } from '../types/faction';
import { allUnits } from '../data/units';
import { allWeapons } from '../data/weapons';
import { weaponFactionId } from '../utils/images';

type CatalogueTab = 'units' | 'weapons';
type ViewMode = 'cards' | 'table';

export default function UnitsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSidebarVisible = useMediaQuery(theme.breakpoints.up('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    units,
    filters,
    availableFactions,
    availableKeywords,
    yearBounds,
    costBounds,
    typeCounts,
    totalCount,
    setName,
    setFactions,
    setTypes,
    setKeywords,
    setYearRange,
    setCostRange,
    isOutOfYear,
  } = useUnitData();
  const activeTab: CatalogueTab = searchParams.get('tab') === 'weapons' ? 'weapons' : 'units';
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [unitPage, setUnitPage] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [weaponName, setWeaponName] = useState('');
  const [weaponFaction, setWeaponFaction] = useState<FactionId | ''>('');

  const unitPageCount = Math.ceil(units.length / UNITS_PER_PAGE);
  const paginatedUnits = useMemo(() => {
    const sorted =
      viewMode === 'cards'
        ? [...units].sort((a, b) => a.name.localeCompare(b.name))
        : units;
    const start = (unitPage - 1) * UNITS_PER_PAGE;
    return sorted.slice(start, start + UNITS_PER_PAGE);
  }, [units, unitPage, viewMode]);

  function getWeaponFaction(id: string): FactionId | '' {
    return weaponFactionId(id) ?? '';
  }

  const catalogueUnits = allUnits;
  const weapons = allWeapons;
  const selectedWeapon = useMemo(() => {
    const weaponId = searchParams.get('weapon');
    return weaponId ? (weapons.find((weapon) => weapon.id === weaponId) ?? null) : null;
  }, [searchParams, weapons]);

  const weaponFactions = useMemo(() => {
    const all = weapons.map((w) => getWeaponFaction(w.id)).filter((f): f is FactionId => !!f);
    return [...new Set(all)].sort();
  }, [weapons]);

  const filteredWeapons = useMemo(() => {
    return weapons.filter((w) => {
      const matchesName = weaponName === '' || w.name.toLowerCase().includes(weaponName.toLowerCase());
      const matchesFaction = weaponFaction === '' || getWeaponFaction(w.id) === weaponFaction;
      return matchesName && matchesFaction;
    });
  }, [weapons, weaponName, weaponFaction]);

  function handleTabChange(value: CatalogueTab) {
    setSearchParams(value === 'weapons' ? { tab: 'weapons' } : {});
  }

  function handleWeaponSelect(weapon: Weapon) {
    setSearchParams({ tab: 'weapons', weapon: weapon.id });
  }

  function handleUnitSelect(unit: Unit) {
    navigate(`/units/${encodeURIComponent(unit.id)}`);
  }

  const sidebarProps = {
    name: filters.name,
    selectedFactions: filters.factions,
    availableFactions,
    selectedTypes: filters.types,
    typeCounts,
    totalCount,
    selectedKeywords: filters.keywords,
    availableKeywords,
    yearRange: [filters.yearFrom, filters.yearTo] as [number, number],
    yearBounds,
    costRange: [filters.costMin, filters.costMax] as [number, number],
    costBounds,
    onNameChange: (v: string) => { setName(v); setUnitPage(1); },
    onFactionsChange: (v: FactionId[]) => { setFactions(v); setUnitPage(1); },
    onTypesChange: (v: typeof filters.types) => { setTypes(v); setUnitPage(1); },
    onKeywordsChange: (v: typeof filters.keywords) => { setKeywords(v); setUnitPage(1); },
    onYearRangeChange: (v: [number, number]) => { setYearRange(v); setUnitPage(1); },
    onCostRangeChange: (v: [number, number]) => { setCostRange(v); setUnitPage(1); },
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('catalogue.title')}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          justifyContent: 'space-between',
          alignItems: { sm: 'center' },
          borderBottom: 1,
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_event, value: CatalogueTab) => handleTabChange(value)}
          aria-label={t('catalogue.tabs.label')}
        >
          <Tab value="units" label={t('catalogue.tabs.units')} />
          <Tab value="weapons" label={t('catalogue.tabs.weapons')} />
        </Tabs>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          size="small"
          onChange={(_event, value: ViewMode | null) => {
            if (value) {
              setViewMode(value);
              setUnitPage(1);
            }
          }}
          aria-label={t('catalogue.view.label')}
          sx={{ mb: { xs: 2, sm: 0 } }}
        >
          <ToggleButton value="cards" aria-label={t('catalogue.view.cards')}>
            <GridViewIcon sx={{ mr: 1 }} />
            {t('catalogue.view.cards')}
          </ToggleButton>
          <ToggleButton value="table" aria-label={t('catalogue.view.table')}>
            <TableRowsIcon sx={{ mr: 1 }} />
            {t('catalogue.view.table')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {activeTab === 'units' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '260px 1fr' },
            alignItems: 'start',
            gap: 3,
          }}
        >
          {isSidebarVisible && <UnitFilterSidebar {...sidebarProps} />}

          <Box>
            <UnitFilterChips
              {...sidebarProps}
              onOpenFilters={isSidebarVisible ? undefined : () => setFilterDrawerOpen(true)}
            />

            <UnitList
              units={paginatedUnits}
              isOutOfYear={isOutOfYear}
              viewMode={viewMode}
              onSelect={handleUnitSelect}
            />
            {unitPageCount > 1 && (
              <Pagination
                count={unitPageCount}
                page={unitPage}
                onChange={(_e, page) => setUnitPage(page)}
                color="secondary"
                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
              />
            )}
          </Box>

          {!isSidebarVisible && (
            <Drawer anchor="left" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)}>
              <Box sx={{ width: 280, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">{t('units.sidebar.filters')}</Typography>
                  <IconButton onClick={() => setFilterDrawerOpen(false)} aria-label={t('common.close')}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                <UnitFilterSidebar {...sidebarProps} />
              </Box>
            </Drawer>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(360px, 1fr)' },
            alignItems: 'start',
            gap: 3,
          }}
        >
          <Box>
            <WeaponFilters
              name={weaponName}
              faction={weaponFaction}
              factions={weaponFactions}
              onNameChange={setWeaponName}
              onFactionChange={setWeaponFaction}
            />
            <WeaponList
              weapons={filteredWeapons}
              selectedId={selectedWeapon?.id ?? null}
              viewMode={viewMode}
              onSelect={handleWeaponSelect}
            />
          </Box>

          <WeaponDetail weapon={selectedWeapon} units={catalogueUnits} />
        </Box>
      )}
    </Box>
  );
}
