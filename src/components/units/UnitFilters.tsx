/**
 * UnitFilters — name, faction, type, and year controls for filtering units.
 */
import { Autocomplete, Box, Checkbox, TextField } from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { useTranslation } from 'react-i18next';
import { UnitType, UnitKeyword } from '../../types/unit';
import type { FactionId } from '../../types/faction';
import FactionSelect from '../factions/FactionSelect';

const UNIT_TYPES: UnitType[] = [
  'infantry', 'tank', 'tank-destroyer', 'assault-gun', 'self-propelled-artillery', 'motorised', 'mechanised',
  'reconnaissance', 'engineer', 'artillery-towed', 'sniper', 'medic',
  'aircraft', 'special',
];

interface Props {
  name: string;
  selectedFaction: FactionId | '';
  factions: FactionId[];
  selectedTypes: UnitType[];
  selectedKeywords: UnitKeyword[];
  availableKeywords: UnitKeyword[];
  year: number | '';
  onNameChange: (v: string) => void;
  onFactionChange: (v: FactionId | '') => void;
  onTypesChange: (v: UnitType[]) => void;
  onKeywordsChange: (v: UnitKeyword[]) => void;
  onYearChange: (v: number | '') => void;
}

export default function UnitFilters({
  name,
  selectedFaction,
  factions,
  selectedTypes,
  selectedKeywords,
  availableKeywords,
  year,
  onNameChange,
  onFactionChange,
  onTypesChange,
  onKeywordsChange,
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

        <FactionSelect
          value={selectedFaction}
          label={t('units.filters.faction')}
          allLabel={t('common.all')}
          allowedFactionIds={factions}
          minWidth={180}
          onChange={onFactionChange}
        />

        <Autocomplete
          multiple
          disableCloseOnSelect
          size="small"
          limitTags={2}
          options={UNIT_TYPES}
          value={selectedTypes}
          getOptionLabel={(option) => t(`units.types.${option}`)}
          onChange={(_event, value) => onTypesChange(value)}
          sx={{
            minWidth: { xs: 260, sm: 360 },
            flex: { xs: '1 1 100%', md: '1 1 360px' },
            '& .MuiInputBase-root': {
              flexWrap: 'nowrap',
              height: '40px',
              overflow: 'hidden',
            },
          }}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;

            return (
              <Box component="li" key={key} {...optionProps}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  checked={selected}
                  sx={{ mr: 1 }}
                />
                {t(`units.types.${option}`)}
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField {...params} size="small" label={t('units.filters.type')} />
          )}
        />

        <Autocomplete
          multiple
          disableCloseOnSelect
          size="small"
          limitTags={2}
          options={availableKeywords}
          value={selectedKeywords}
          getOptionLabel={(option) => t(`units.keywords.${option}`, { defaultValue: option })}
          onChange={(_event, value) => onKeywordsChange(value)}
          sx={{
            minWidth: { xs: 200, sm: 280 },
            flex: { xs: '1 1 100%', md: '0 1 280px' },
            '& .MuiInputBase-root': {
              flexWrap: 'nowrap',
              height: '40px',
              overflow: 'hidden',
            },
          }}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (
              <Box component="li" key={key} {...optionProps}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  checked={selected}
                  sx={{ mr: 1 }}
                />
                {t(`units.keywords.${option}`, { defaultValue: option })}
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField {...params} size="small" label={t('units.filters.keyword')} />
          )}
        />
      </Box>
    </Box>
  );
}
