/**
 * UnitsPage - tabbed unit and weapon catalogue with card/table views and detail panels.
 */
import { useState, useMemo } from 'react';
import {
  Box,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUnitData } from '../hooks/useUnitData';
import UnitFilters from '../components/units/UnitFilters';
import UnitList from '../components/units/UnitList';
import UnitDetail from '../components/units/UnitDetail';
import WeaponList from '../components/weapons/WeaponList';
import WeaponDetail from '../components/weapons/WeaponDetail';
import WeaponFilters from '../components/weapons/WeaponFilters';
import { Unit } from '../types/unit';
import { Weapon } from '../types/weapon';
import unitsData from '../data/units/units.json';
import weaponsData from '../data/weapons/weapons.json';

type CatalogueTab = 'units' | 'weapons';
type ViewMode = 'cards' | 'table';

export default function UnitsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [searchParams, setSearchParams] = useSearchParams();
  const { units, filters, setName, toggleFaction, toggleType, setYear, isOutOfYear } = useUnitData();
  const activeTab: CatalogueTab = searchParams.get('tab') === 'weapons' ? 'weapons' : 'units';
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [weaponName, setWeaponName] = useState('');
  const [weaponFaction, setWeaponFaction] = useState('');

  function getWeaponFaction(id: string): string {
    if (id.startsWith('german-')) return 'german';
    if (id.startsWith('su-')) return 'soviet';
    return '';
  }

  const factions = useMemo(() => {
    const all = (unitsData.units as unknown as Unit[]).map((u) => u.faction);
    return [...new Set(all)].sort();
  }, []);

  const catalogueUnits = unitsData.units as unknown as Unit[];
  const weapons = weaponsData.weapons as unknown as Weapon[];
  const selectedWeapon = useMemo(() => {
    const weaponId = searchParams.get('weapon');
    return weaponId ? (weapons.find((weapon) => weapon.id === weaponId) ?? null) : null;
  }, [searchParams, weapons]);

  const weaponFactions = useMemo(() => {
    const all = weapons.map((w) => getWeaponFaction(w.id)).filter(Boolean);
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
    if (isDesktop) {
      setSelectedUnit(unit);
      return;
    }
    navigate(`/units/${encodeURIComponent(unit.id)}`);
  }

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
          onChange={(_event, value: ViewMode | null) => value && setViewMode(value)}
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
        <>
          <UnitFilters
            name={filters.name}
            selectedFactions={filters.factions}
            factions={factions}
            selectedTypes={filters.types}
            year={filters.year}
            onNameChange={setName}
            onFactionToggle={toggleFaction}
            onTypeToggle={toggleType}
            onYearChange={setYear}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: selectedUnit ? 'minmax(0, 1fr) minmax(360px, 460px)' : '1fr',
              },
              alignItems: 'start',
              gap: 3,
            }}
          >
            <UnitList
              units={units}
              isOutOfYear={isOutOfYear}
              selectedId={selectedUnit?.id ?? null}
              viewMode={viewMode}
              onSelect={handleUnitSelect}
            />

            {isDesktop && (
              <UnitDetail
                unit={selectedUnit}
                weapons={weapons}
                onClose={() => setSelectedUnit(null)}
              />
            )}
          </Box>
        </>
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
