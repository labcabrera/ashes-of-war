/**
 * UnitFilterChips — removable chips summarising the active unit catalogue filters,
 * with an optional trigger to open the filter sidebar (mobile/tablet).
 */
import { Box, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import { useTranslation } from 'react-i18next';
import { UnitType, UnitKeyword } from '../../types/unit';
import type { FactionId } from '../../types/faction';
import type { NumericRange } from '../../hooks/useUnitData';
import { formatUnitKeyword } from '../../utils/unitKeywords';

interface Props {
  name: string;
  selectedFactions: FactionId[];
  selectedTypes: UnitType[];
  selectedKeywords: UnitKeyword[];
  yearRange: [number, number];
  yearBounds: NumericRange;
  costRange: [number, number];
  costBounds: NumericRange;
  onNameChange: (v: string) => void;
  onFactionsChange: (v: FactionId[]) => void;
  onTypesChange: (v: UnitType[]) => void;
  onKeywordsChange: (v: UnitKeyword[]) => void;
  onYearRangeChange: (v: [number, number]) => void;
  onCostRangeChange: (v: [number, number]) => void;
  onOpenFilters?: () => void;
}

export default function UnitFilterChips({
  name,
  selectedFactions,
  selectedTypes,
  selectedKeywords,
  yearRange,
  yearBounds,
  costRange,
  costBounds,
  onNameChange,
  onFactionsChange,
  onTypesChange,
  onKeywordsChange,
  onYearRangeChange,
  onCostRangeChange,
  onOpenFilters,
}: Props) {
  const { t } = useTranslation();

  const yearNarrowed = yearRange[0] !== yearBounds.min || yearRange[1] !== yearBounds.max;
  const costNarrowed = costRange[0] !== costBounds.min || costRange[1] !== costBounds.max;

  const hasActiveFilters =
    name !== '' ||
    selectedFactions.length > 0 ||
    selectedTypes.length > 0 ||
    selectedKeywords.length > 0 ||
    yearNarrowed ||
    costNarrowed;

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
          label={t(`units.types.${type}`)}
          size="small"
          color="secondary"
          variant="outlined"
          onDelete={() => onTypesChange(selectedTypes.filter((t2) => t2 !== type))}
        />
      ))}
      {selectedKeywords.map((keyword) => (
        <Chip
          key={keyword}
          label={formatUnitKeyword(keyword, t)}
          size="small"
          color="secondary"
          variant="outlined"
          onDelete={() => onKeywordsChange(selectedKeywords.filter((k) => k !== keyword))}
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
      {costNarrowed && (
        <Chip
          label={`${costRange[0]}–${costRange[1]} ${t('units.sidebar.costUnit')}`}
          size="small"
          color="secondary"
          variant="outlined"
          onDelete={() => onCostRangeChange([costBounds.min, costBounds.max])}
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
