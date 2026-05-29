/**
 * ArmyTypeSelector — two linked dropdowns: faction then year range.
 * Selecting a faction filters the year options; together they determine the army type.
 */
import { useEffect, useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArmyType } from '../../types/army';

interface Props {
  armyTypes: ArmyType[];
  selectedId: string;
  onChange: (id: string) => void;
}

export default function ArmyTypeSelector({ armyTypes, selectedId, onChange }: Props) {
  const { t } = useTranslation();

  const selectedType = armyTypes.find((at) => at.id === selectedId);
  const [faction, setFaction] = useState(selectedType?.faction ?? armyTypes[0]?.faction ?? '');

  // Keep faction in sync when selectedId is changed externally (e.g. loading a saved army).
  useEffect(() => {
    const type = armyTypes.find((at) => at.id === selectedId);
    if (type?.faction && type.faction !== faction) setFaction(type.faction);
  }, [selectedId, armyTypes]); // eslint-disable-line react-hooks/exhaustive-deps

  const factions = [...new Set(armyTypes.map((at) => at.faction).filter((f): f is string => !!f))];
  const factionTypes = armyTypes.filter((at) => at.faction === faction);

  const handleFactionChange = (newFaction: string) => {
    setFaction(newFaction);
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
            <MenuItem key={f} value={f}>
              {t(`army.faction.${f}`, f)}
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
