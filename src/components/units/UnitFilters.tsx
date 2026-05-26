/**
 * UnitFilters — name, faction, type, and year controls for filtering units.
 * Year filter is the FR-019 requirement.
 */
import { Box, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

const FACTION_FLAGS: Record<string, string> = {
  german: '/images/german.png',
  soviet: '/images/soviet.png',
};
import { useTranslation } from 'react-i18next';
import { UnitType } from '../../types/unit';

const UNIT_TYPES: UnitType[] = [
  'infantry', 'tank', 'tank-destroyer', 'assault-gun', 'self-propelled-artillery', 'motorised', 'mechanised',
  'reconnaissance', 'engineer', 'artillery-towed', 'sniper', 'medic',
  'aircraft', 'special',
];

interface Props {
  name: string;
  faction: string;
  factions: string[];
  type: UnitType | '';
  year: number | '';
  onNameChange: (v: string) => void;
  onFactionChange: (v: string) => void;
  onTypeChange: (v: UnitType | '') => void;
  onYearChange: (v: number | '') => void;
}

export default function UnitFilters({
  name,
  faction,
  factions,
  type,
  year,
  onNameChange,
  onFactionChange,
  onTypeChange,
  onYearChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
      <TextField
        size="small"
        label={t('units.filters.name')}
        type="search"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        sx={{ minWidth: 220 }}
      />

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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {FACTION_FLAGS[f] && (
                  <Box
                    component="img"
                    src={FACTION_FLAGS[f]}
                    alt={f}
                    sx={{ height: 16, width: 'auto', borderRadius: 0.5 }}
                  />
                )}
                {f}
              </Box>
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
