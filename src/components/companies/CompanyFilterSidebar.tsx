/**
 * CompanyFilterSidebar filters the static company catalogue.
 */
import { Box, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { FactionId } from '../../types/faction';
import { factionColor } from '../../utils/factionColors';
import { FilterSection, OptionRow, optionRowSx, toggleValue } from '../common/FilterSidebarPrimitives';

interface Props {
  name: string;
  selectedFactions: FactionId[];
  availableFactions: FactionId[];
  factionCounts: Record<FactionId, number>;
  totalCount: number;
  onNameChange: (value: string) => void;
  onFactionsChange: (value: FactionId[]) => void;
}

export default function CompanyFilterSidebar({
  name,
  selectedFactions,
  availableFactions,
  factionCounts,
  totalCount,
  onNameChange,
  onFactionsChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <Box>
      <FilterSection title={t('companies.sidebar.search')}>
        <TextField
          fullWidth
          size="small"
          type="search"
          placeholder={t('companies.sidebar.searchPlaceholder')}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />
      </FilterSection>

      <FilterSection title={t('companies.sidebar.faction')}>
        <FormControlLabel
          sx={optionRowSx}
          control={
            <Checkbox
              size="small"
              checked={selectedFactions.length === 0}
              onChange={() => onFactionsChange([])}
            />
          }
          label={
            <OptionRow count={totalCount}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: selectedFactions.length === 0 ? 700 : 400,
                  color: selectedFactions.length === 0 ? 'secondary.main' : 'text.primary',
                }}
              >
                {t('companies.sidebar.allFactions')}
              </Typography>
            </OptionRow>
          }
        />
        {availableFactions.map((faction) => (
          <FormControlLabel
            key={faction}
            sx={optionRowSx}
            control={
              <Checkbox
                size="small"
                checked={selectedFactions.includes(faction)}
                onChange={() => onFactionsChange(toggleValue(selectedFactions, faction))}
              />
            }
            label={
              <OptionRow count={factionCounts[faction]}>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    flexShrink: 0,
                    borderRadius: 0.5,
                    bgcolor: factionColor(faction),
                  }}
                />
                {t(`factions.${faction}`, faction)}
              </OptionRow>
            }
          />
        ))}
      </FilterSection>
    </Box>
  );
}
