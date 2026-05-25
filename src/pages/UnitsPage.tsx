/**
 * UnitsPage - unit roster browser with faction, type, year filters, and detail panel (FR-019).
 */
import { useState, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUnitData } from '../hooks/useUnitData';
import UnitFilters from '../components/units/UnitFilters';
import UnitList from '../components/units/UnitList';
import UnitDetail from '../components/units/UnitDetail';
import { Unit } from '../types/unit';
import unitsData from '../data/units/units.json';

export default function UnitsPage() {
  const { t } = useTranslation();
  const { units, filters, setFilaction, setType, setYear, isOutOfYear } = useUnitData();
  const [selected, setSelected] = useState<Unit | null>(null);

  const factions = useMemo(() => {
    const all = (unitsData.units as unknown as Unit[]).map((u) => u.faction);
    return [...new Set(all)].sort();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('units.title')}
      </Typography>

      <UnitFilters
        faction={filters.faction}
        factions={factions}
        type={filters.type}
        year={filters.year}
        onFactionChange={setFilaction}
        onTypeChange={setType}
        onYearChange={setYear}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(320px, 1fr)' },
          alignItems: 'start',
          gap: 3,
        }}
      >
        <UnitList
          units={units}
          isOutOfYear={isOutOfYear}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />

        <UnitDetail unit={selected} />
      </Box>
    </Box>
  );
}
