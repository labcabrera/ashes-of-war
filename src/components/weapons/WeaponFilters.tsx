/**
 * WeaponFilters — name and faction controls for filtering the weapon catalogue.
 */
import { Box, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const FACTION_FLAGS: Record<string, string> = {
  german: '/images/german.png',
  soviet: '/images/soviet.png',
};

interface Props {
  name: string;
  faction: string;
  factions: string[];
  onNameChange: (v: string) => void;
  onFactionChange: (v: string) => void;
}

export default function WeaponFilters({ name, faction, factions, onNameChange, onFactionChange }: Props) {
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
          {factions.map((f) => {
            const label = t(`factions.${f}`, f);
            return (
              <MenuItem key={f} value={f}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {FACTION_FLAGS[f] && (
                    <Box
                      component="img"
                      src={FACTION_FLAGS[f]}
                      alt={label}
                      sx={{ height: 16, width: 'auto', borderRadius: 0.5 }}
                    />
                  )}
                  {label}
                </Box>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Box>
  );
}
