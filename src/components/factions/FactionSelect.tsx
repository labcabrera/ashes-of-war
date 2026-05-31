import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import factionsData from '../../data/factions/factions.json';
import type { Faction, FactionId } from '../../types/faction';
import { factionFlagUrl } from '../../utils/images';

interface Props {
  value: FactionId | '';
  onChange: (value: FactionId | '') => void;
  label: string;
  allLabel?: string;
  allowedFactionIds?: FactionId[];
  disabledFactionIds?: FactionId[];
  minWidth?: number;
  size?: 'small' | 'medium';
}

const factions = factionsData.factions as Faction[];

function FactionOption({ faction }: { faction: Faction }) {
  const { t } = useTranslation();
  const label = t(faction.label);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Box
        component="img"
        src={factionFlagUrl(faction.id)}
        alt={label}
        sx={{ height: 16, width: 24, objectFit: 'cover', borderRadius: 0.5, flexShrink: 0 }}
      />
      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </Box>
    </Box>
  );
}

export default function FactionSelect({
  value,
  onChange,
  label,
  allLabel,
  allowedFactionIds,
  disabledFactionIds = [],
  minWidth = 190,
  size = 'small',
}: Props) {
  const allowed = allowedFactionIds ? new Set(allowedFactionIds) : undefined;
  const disabled = new Set(disabledFactionIds);
  const visibleFactions = allowed ? factions.filter((faction) => allowed.has(faction.id)) : factions;
  const selectedFaction = factions.find((faction) => faction.id === value);

  function handleChange(event: SelectChangeEvent<FactionId | ''>) {
    onChange(event.target.value as FactionId | '');
  }

  return (
    <FormControl size={size} sx={{ minWidth }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={handleChange}
        renderValue={(selected) => {
          if (!selected) return allLabel ?? '';

          return selectedFaction ? <FactionOption faction={selectedFaction} /> : selected;
        }}
      >
        {allLabel && <MenuItem value="">{allLabel}</MenuItem>}
        {visibleFactions.map((faction) => (
          <MenuItem key={faction.id} value={faction.id} disabled={disabled.has(faction.id)}>
            <FactionOption faction={faction} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
