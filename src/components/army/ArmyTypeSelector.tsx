/**
 * ArmyTypeSelector — dropdown to pick an army type template.
 */
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArmyType } from '../../types/army';

interface Props {
  armyTypes: ArmyType[];
  selectedId: string;
  onChange: (id: string) => void;
}

export default function ArmyTypeSelector({ armyTypes, selectedId, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <FormControl size="small" sx={{ minWidth: 240 }}>
      <InputLabel>{t('army.selectType')}</InputLabel>
      <Select
        value={selectedId}
        label={t('army.selectType')}
        onChange={(e) => onChange(e.target.value)}
      >
        {armyTypes.map((at) => (
          <MenuItem key={at.id} value={at.id}>
            {at.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
