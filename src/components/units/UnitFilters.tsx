/**
 * UnitFilters — faction Select, type Select, and year TextField for filtering units.
 * Year filter is the FR-019 requirement.
 */
import { Box, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UnitType } from '../../types/unit';

const UNIT_TYPES: UnitType[] = [
  'infantry', 'tank', 'artillery', 'motorised', 'mechanised',
  'reconnaissance', 'engineer', 'artillery-towed', 'sniper', 'medic',
  'aircraft', 'special',
];

interface Props {
  faction: string;
  factions: string[];
  type: UnitType | '';
  year: number | '';
  onFactionChange: (v: string) => void;
  onTypeChange: (v: UnitType | '') => void;
  onYearChange: (v: number | '') => void;
}

export default function UnitFilters({
  faction,
  factions,
  type,
  year,
  onFactionChange,
  onTypeChange,
  onYearChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>{t('units.filters.faction')}</InputLabel>
        <Select
          value={faction}
          label={t('units.filters.faction')}
          onChange={(e) => onFactionChange(e.target.value)}
        >
          <MenuItem value="">{t('common.all')}</MenuItem>
          {factions.map((f) => (
            <MenuItem key={f} value={f}>
              {f}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>{t('units.filters.type')}</InputLabel>
        <Select
          value={type}
          label={t('units.filters.type')}
          onChange={(e) => onTypeChange(e.target.value as UnitType | '')}
        >
          <MenuItem value="">{t('common.all')}</MenuItem>
          {UNIT_TYPES.map((ut) => (
            <MenuItem key={ut} value={ut}>
              {t(`units.types.${ut}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        label={t('units.filters.year')}
        type="number"
        value={year}
        onChange={(e) => {
          const val = e.target.value;
          onYearChange(val === '' ? '' : Number(val));
        }}
        slotProps={{ htmlInput: { min: 1939, max: 1945 } }}
        sx={{ width: 100 }}
      />
    </Box>
  );
}
