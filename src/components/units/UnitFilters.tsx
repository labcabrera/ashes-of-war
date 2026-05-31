/**
 * UnitFilters — name, faction (chips), type (chips), and year controls for filtering units.
 */
import { Avatar, Box, Chip, TextField, Typography } from '@mui/material';

const FACTION_FLAGS: Record<string, string> = {
  german: '/images/factions/germany.jpg',
  'soviet-union': '/images/factions/soviet-union.jpg',
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
  selectedFactions: string[];
  factions: string[];
  selectedTypes: UnitType[];
  year: number | '';
  onNameChange: (v: string) => void;
  onFactionToggle: (v: string) => void;
  onTypeToggle: (v: UnitType) => void;
  onYearChange: (v: number | '') => void;
}

export default function UnitFilters({
  name,
  selectedFactions,
  factions,
  selectedTypes,
  year,
  onNameChange,
  onFactionToggle,
  onTypeToggle,
  onYearChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label={t('units.filters.name')}
          type="search"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          sx={{ minWidth: 220 }}
        />
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

      {factions.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
            {t('units.filters.faction')}:
          </Typography>
          {factions.map((f) => {
            const selected = selectedFactions.includes(f);
            const label = t(`factions.${f}`, f);
            return (
              <Chip
                key={f}
                label={label}
                onClick={() => onFactionToggle(f)}
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
                avatar={
                  FACTION_FLAGS[f]
                    ? <Avatar src={FACTION_FLAGS[f]} alt={label} />
                    : undefined
                }
              />
            );
          })}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
          {t('units.filters.type')}:
        </Typography>
        {UNIT_TYPES.map((ut) => {
          const selected = selectedTypes.includes(ut);
          return (
            <Chip
              key={ut}
              label={t(`units.types.${ut}`)}
              onClick={() => onTypeToggle(ut)}
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
            />
          );
        })}
      </Box>
    </Box>
  );
}
