/**
 * WeaponFilters — name and faction controls for filtering the weapon catalogue.
 */
import { Box, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { FactionId } from '../../types/faction';
import FactionSelect from '../factions/FactionSelect';

interface Props {
  name: string;
  faction: FactionId | '';
  factions: FactionId[];
  onNameChange: (v: string) => void;
  onFactionChange: (v: FactionId | '') => void;
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

      <FactionSelect
        value={faction}
        label={t('units.filters.faction')}
        allLabel={t('common.all')}
        allowedFactionIds={factions}
        minWidth={160}
        onChange={onFactionChange}
      />
    </Box>
  );
}
