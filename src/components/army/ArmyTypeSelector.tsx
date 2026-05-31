/**
 * ArmyTypeSelector — two linked dropdowns: faction then year range.
 * Selecting a faction filters the year options; together they determine the army type.
 */
import { FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArmyType } from '../../types/army';
import type { FactionId } from '../../types/faction';
import FactionSelect from '../factions/FactionSelect';

interface Props {
  armyTypes: ArmyType[];
  selectedId: string;
  onChange: (id: string) => void;
}

export default function ArmyTypeSelector({ armyTypes, selectedId, onChange }: Props) {
  const { t } = useTranslation();

  const selectedType = armyTypes.find((at) => at.id === selectedId);
  const faction = selectedType?.faction ?? armyTypes[0]?.faction ?? '';

  const availableFactions = armyTypes.map((at) => at.faction).filter((f): f is FactionId => !!f);
  const factionTypes = armyTypes.filter((at) => at.faction === faction);
  const enabledFactionIds = new Set(availableFactions);
  const disabledFactionIds = (
    [
      'german',
      'soviet-union',
      'united-states',
      'united-kingdom',
      'france',
      'italy',
      'japan',
      'finland',
      'romania',
      'china',
    ] as const
  ).filter((factionId) => !enabledFactionIds.has(factionId));

  const handleFactionChange = (newFaction: FactionId | '') => {
    const first = armyTypes.find((at) => at.faction === newFaction);
    if (first) onChange(first.id);
  };

  return (
    <Stack direction="row" spacing={1.5}>
      <FactionSelect
        value={faction}
        label={t('army.faction.label')}
        disabledFactionIds={disabledFactionIds}
        onChange={handleFactionChange}
      />

      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>{t('army.year.label')}</InputLabel>
        <Select
          value={selectedId}
          label={t('army.year.label')}
          onChange={(e) => onChange(e.target.value)}
        >
          {factionTypes.map((at) => (
            <MenuItem key={at.id} value={at.id}>
              {at.yearRange ? `${at.yearRange.start}–${at.yearRange.end}` : at.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
