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
} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { useTranslation } from 'react-i18next';
import { useUnitData } from '../hooks/useUnitData';
import UnitFilters from '../components/units/UnitFilters';
import UnitList from '../components/units/UnitList';
import UnitDetail from '../components/units/UnitDetail';
import WeaponList from '../components/weapons/WeaponList';
import WeaponDetail from '../components/weapons/WeaponDetail';
import { Unit } from '../types/unit';
import { Weapon } from '../types/weapon';
import unitsData from '../data/units/units.json';
import weaponsData from '../data/weapons/weapons.json';

type CatalogueTab = 'units' | 'weapons';
type ViewMode = 'cards' | 'table';

export default function UnitsPage() {
  const { t } = useTranslation();
  const { units, filters, setName, setFilaction, setType, setYear, isOutOfYear } = useUnitData();
  const [activeTab, setActiveTab] = useState<CatalogueTab>('units');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);

  const factions = useMemo(() => {
    const all = (unitsData.units as unknown as Unit[]).map((u) => u.faction);
    return [...new Set(all)].sort();
  }, []);

  const weapons = weaponsData.weapons as unknown as Weapon[];

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
          onChange={(_event, value: CatalogueTab) => setActiveTab(value)}
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
            faction={filters.faction}
            factions={factions}
            type={filters.type}
            year={filters.year}
            onNameChange={setName}
            onFactionChange={setFilaction}
            onTypeChange={setType}
            onYearChange={setYear}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.65fr) minmax(420px, 1fr)' },
              alignItems: 'start',
              gap: 3,
            }}
          >
            <UnitList
              units={units}
              isOutOfYear={isOutOfYear}
              selectedId={selectedUnit?.id ?? null}
              viewMode={viewMode}
              onSelect={setSelectedUnit}
            />

            <UnitDetail unit={selectedUnit} weapons={weapons} />
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
          <WeaponList
            weapons={weapons}
            selectedId={selectedWeapon?.id ?? null}
            viewMode={viewMode}
            onSelect={setSelectedWeapon}
          />

          <WeaponDetail weapon={selectedWeapon} />
        </Box>
      )}
    </Box>
  );
}
