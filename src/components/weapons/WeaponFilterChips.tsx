/**
 * WeaponFilterChips — removable chips summarising the active weapon catalogue filters,
 * with an optional trigger to open the filter sidebar (mobile/tablet).
 */
import { Box, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import { useTranslation } from 'react-i18next';
import { WeaponType } from '../../types/weapon';
import type { FactionId } from '../../types/faction';
import type { NumericRange } from '../../hooks/useUnitData';

interface Props {
  name: string;
  selectedFactions: FactionId[];
  selectedTypes: WeaponType[];
  yearRange: [number, number];
  yearBounds: NumericRange;
  onNameChange: (v: string) => void;
  onFactionsChange: (v: FactionId[]) => void;
  onTypesChange: (v: WeaponType[]) => void;
  onYearRangeChange: (v: [number, number]) => void;
  onOpenFilters?: () => void;
}

export default function WeaponFilterChips({
  name,
  selectedFactions,
  selectedTypes,
  yearRange,
  yearBounds,
  onNameChange,
  onFactionsChange,
  onTypesChange,
  onYearRangeChange,
  onOpenFilters,
}: Props) {
  const { t } = useTranslation();

  const yearNarrowed = yearRange[0] !== yearBounds.min || yearRange[1] !== yearBounds.max;

  const hasActiveFilters =
    name !== '' || selectedFactions.length > 0 || selectedTypes.length > 0 || yearNarrowed;

  if (!hasActiveFilters && !onOpenFilters) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 2 }}>
      {name !== '' && (
        <Chip label={name} size="small" color="secondary" variant="outlined" onDelete={() => onNameChange('')} />
      )}
      {selectedFactions.map((faction) => (
        <Chip
          key={faction}
          label={t(`factions.${faction}`, faction)}
          size="small"
          color="secondary"
          variant="outlined"
          onDelete={() => onFactionsChange(selectedFactions.filter((f) => f !== faction))}
        />
      ))}
      {selectedTypes.map((type) => (
        <Chip
          key={type}
          label={t(`weapons.types.${type}`)}
          size="small"
          color="secondary"
          variant="outlined"
          onDelete={() => onTypesChange(selectedTypes.filter((t2) => t2 !== type))}
        />
      ))}
      {yearNarrowed && (
        <Chip
          label={`${yearRange[0]}–${yearRange[1]}`}
          size="small"
          color="secondary"
          variant="outlined"
          onDelete={() => onYearRangeChange([yearBounds.min, yearBounds.max])}
        />
      )}
      {onOpenFilters && (
        <Chip
          icon={hasActiveFilters ? <AddIcon /> : <TuneIcon />}
          label={t('units.sidebar.addFilter')}
          size="small"
          variant="outlined"
          onClick={onOpenFilters}
          sx={{ borderStyle: 'dashed' }}
        />
      )}
    </Box>
  );
}
