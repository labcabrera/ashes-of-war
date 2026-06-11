/**
 * WeaponFilterSidebar — collapsible sidebar with search, faction, weapon type and service
 * year filters for the weapon catalogue, mirroring UnitFilterSidebar.
 */
import { Box, Checkbox, FormControlLabel, Slider, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { WeaponType, WEAPON_TYPES } from '../../types/weapon';
import type { FactionId } from '../../types/faction';
import type { NumericRange } from '../../hooks/useUnitData';
import { factionColor } from '../../utils/factionColors';
import { FilterSection, OptionRow, optionRowSx, toggleValue } from '../common/FilterSidebarPrimitives';

interface Props {
  name: string;
  selectedFactions: FactionId[];
  availableFactions: FactionId[];
  selectedTypes: WeaponType[];
  typeCounts: Record<WeaponType, number>;
  totalCount: number;
  yearRange: [number, number];
  yearBounds: NumericRange;
  onNameChange: (v: string) => void;
  onFactionsChange: (v: FactionId[]) => void;
  onTypesChange: (v: WeaponType[]) => void;
  onYearRangeChange: (v: [number, number]) => void;
}

export default function WeaponFilterSidebar({
  name,
  selectedFactions,
  availableFactions,
  selectedTypes,
  typeCounts,
  totalCount,
  yearRange,
  yearBounds,
  onNameChange,
  onFactionsChange,
  onTypesChange,
  onYearRangeChange,
}: Props) {
  const { t } = useTranslation();

  const visibleTypes = [...WEAPON_TYPES]
    .filter((type) => typeCounts[type] > 0 || selectedTypes.includes(type))
    .sort((a, b) => {
      const diff = typeCounts[b] - typeCounts[a];
      return diff !== 0 ? diff : t(`weapons.types.${a}`).localeCompare(t(`weapons.types.${b}`));
    });

  return (
    <Box>
      <FilterSection title={t('units.sidebar.search')}>
        <TextField
          fullWidth
          size="small"
          type="search"
          placeholder={t('weapons.sidebar.searchPlaceholder')}
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

      <FilterSection title={t('weapons.sidebar.weaponType')}>
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
            label={<OptionRow count={typeCounts[type]}>{t(`weapons.types.${type}`)}</OptionRow>}
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
    </Box>
  );
}
