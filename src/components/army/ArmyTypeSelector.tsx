/**
 * ArmyTypeSelector — two linked dropdowns: faction then year range.
 * Selecting a faction filters the year options; together they determine the army type.
 */
import { FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArmyType } from '../../types/army';
import { Faction } from '../../types/faction';
import factionsData from '../../data/factions/factions.json';

interface Props {
  armyTypes: ArmyType[];
  selectedId: string;
  onChange: (id: string) => void;
}

export default function ArmyTypeSelector({ armyTypes, selectedId, onChange }: Props) {
  const { t } = useTranslation();

  const selectedType = armyTypes.find((at) => at.id === selectedId);
  const faction = selectedType?.faction ?? armyTypes[0]?.faction ?? '';

  const factions = factionsData.factions as Faction[];
  const availableFactions = new Set(
    armyTypes.map((at) => at.faction).filter((f): f is NonNullable<ArmyType['faction']> => !!f),
  );
  const factionTypes = armyTypes.filter((at) => at.faction === faction);

  const handleFactionChange = (newFaction: string) => {
    const first = armyTypes.find((at) => at.faction === newFaction);
    if (first) onChange(first.id);
  };

  return (
    <Stack direction="row" spacing={1.5}>
      <FormControl size="small" sx={{ minWidth: 190 }}>
        <InputLabel>{t('army.faction.label')}</InputLabel>
        <Select
          value={faction}
          label={t('army.faction.label')}
          onChange={(e) => handleFactionChange(e.target.value)}
        >
          {factions.map((f) => (
            <MenuItem key={f.id} value={f.id} disabled={!availableFactions.has(f.id)}>
              {t(f.label)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
