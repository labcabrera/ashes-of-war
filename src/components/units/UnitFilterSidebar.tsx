/**
 * UnitFilterSidebar — collapsible sidebar with search, faction, unit type, service year
 * and cost filters for the unit catalogue.
 */
import {
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { useTranslation } from 'react-i18next';
import { UnitType, UnitKeyword, UNIT_TYPES } from '../../types/unit';
import type { FactionId } from '../../types/faction';
import type { NumericRange } from '../../hooks/useUnitData';
import { factionColor } from '../../utils/factionColors';
import { formatUnitKeyword } from '../../utils/unitKeywords';
import { FilterSection, OptionRow, optionRowSx, toggleValue } from '../common/FilterSidebarPrimitives';

interface Props {
  name: string;
  selectedFactions: FactionId[];
  availableFactions: FactionId[];
  selectedTypes: UnitType[];
  typeCounts: Record<UnitType, number>;
  totalCount: number;
  selectedKeywords: UnitKeyword[];
  availableKeywords: UnitKeyword[];
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
}

export default function UnitFilterSidebar({
  name,
  selectedFactions,
  availableFactions,
  selectedTypes,
  typeCounts,
  totalCount,
  selectedKeywords,
  availableKeywords,
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
}: Props) {
  const { t } = useTranslation();

  const visibleTypes = [...UNIT_TYPES]
    .filter((type) => typeCounts[type] > 0 || selectedTypes.includes(type))
    .sort((a, b) => {
      const diff = typeCounts[b] - typeCounts[a];
      return diff !== 0 ? diff : t(`units.types.${a}`).localeCompare(t(`units.types.${b}`));
    });

  return (
    <Box>
      <FilterSection title={t('units.sidebar.search')}>
        <TextField
          fullWidth
          size="small"
          type="search"
          placeholder={t('units.sidebar.searchPlaceholder')}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </FilterSection>

      <FilterSection title={t('units.sidebar.faction')}>
        <FormControlLabel
          sx={optionRowSx}
          control={
            <Checkbox
              size="small"
              checked={selectedFactions.length === 0}
              onChange={() => onFactionsChange([])}
            />
          }
          label={t('units.sidebar.allFactions')}
        />
        {availableFactions.map((faction) => (
          <FormControlLabel
            key={faction}
            sx={optionRowSx}
            control={
              <Checkbox
                size="small"
                checked={selectedFactions.includes(faction)}
                onChange={() => onFactionsChange(toggleValue(selectedFactions, faction))}
              />
            }
            label={
              <OptionRow>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    flexShrink: 0,
                    borderRadius: 0.5,
                    bgcolor: factionColor(faction),
                  }}
                />
                {t(`factions.${faction}`, faction)}
              </OptionRow>
            }
          />
        ))}
      </FilterSection>

      <FilterSection title={t('units.sidebar.unitType')}>
        <FormControlLabel
          sx={optionRowSx}
          control={
            <Checkbox
              size="small"
              checked={selectedTypes.length === 0}
              onChange={() => onTypesChange([])}
            />
          }
          label={
            <OptionRow count={totalCount}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: selectedTypes.length === 0 ? 700 : 400,
                  color: selectedTypes.length === 0 ? 'secondary.main' : 'text.primary',
                }}
              >
                {t('units.sidebar.allTypes')}
              </Typography>
            </OptionRow>
          }
        />
        {visibleTypes.map((type) => (
          <FormControlLabel
            key={type}
            sx={optionRowSx}
            control={
              <Checkbox
                size="small"
                checked={selectedTypes.includes(type)}
                onChange={() => onTypesChange(toggleValue(selectedTypes, type))}
              />
            }
            label={<OptionRow count={typeCounts[type]}>{t(`units.types.${type}`)}</OptionRow>}
          />
        ))}
      </FilterSection>

      <FilterSection title={t('units.sidebar.serviceYear')}>
        <Box sx={{ px: 1, width: '100%' }}>
          <Slider
            size="small"
            color="secondary"
            value={yearRange}
            min={yearBounds.min}
            max={yearBounds.max}
            step={1}
            marks={[
              { value: yearBounds.min, label: String(yearBounds.min) },
              { value: yearBounds.max, label: String(yearBounds.max) },
            ]}
            valueLabelDisplay="auto"
            onChange={(_event, value) => onYearRangeChange(value as [number, number])}
            sx={{ '& .MuiSlider-markLabel': { fontSize: '0.7rem', color: 'text.secondary' } }}
          />
        </Box>
      </FilterSection>

      <FilterSection title={t('units.sidebar.cost')}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <TextField
            size="small"
            type="number"
            value={costRange[0]}
            onChange={(e) => {
              const value = Math.max(costBounds.min, Math.min(Number(e.target.value), costRange[1]));
              onCostRangeChange([value, costRange[1]]);
            }}
            slotProps={{ htmlInput: { min: costBounds.min, max: costBounds.max } }}
            sx={{ width: 80 }}
          />
          <Typography color="text.secondary">—</Typography>
          <TextField
            size="small"
            type="number"
            value={costRange[1]}
            onChange={(e) => {
              const value = Math.min(costBounds.max, Math.max(Number(e.target.value), costRange[0]));
              onCostRangeChange([costRange[0], value]);
            }}
            slotProps={{
              htmlInput: { min: costBounds.min, max: costBounds.max },
              input: { endAdornment: <InputAdornment position="end">{t('units.sidebar.costUnit')}</InputAdornment> },
            }}
            sx={{ width: 100 }}
          />
        </Box>
      </FilterSection>

      <FilterSection title={t('units.sidebar.keywords')}>
        <Autocomplete
          multiple
          disableCloseOnSelect
          fullWidth
          size="small"
          options={availableKeywords}
          value={selectedKeywords}
          getOptionLabel={(option) => formatUnitKeyword(option, t)}
          onChange={(_event, value) => onKeywordsChange(value)}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (
              <Box component="li" key={key} {...optionProps}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  checked={selected}
                  sx={{ mr: 1 }}
                />
                {formatUnitKeyword(option, t)}
              </Box>
            );
          }}
          renderInput={(params) => <TextField {...params} size="small" />}
        />
      </FilterSection>
    </Box>
  );
}
