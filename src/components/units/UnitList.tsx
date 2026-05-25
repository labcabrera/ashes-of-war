/**
 * UnitList — renders a grid of UnitCard components.
 * Out-of-year units remain visible at reduced opacity (FR-019).
 */
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Unit } from '../../types/unit';
import UnitCard from './UnitCard';

interface Props {
  units: Unit[];
  isOutOfYear: (unit: Unit) => boolean;
  onSelect: (unit: Unit) => void;
}

export default function UnitList({ units, isOutOfYear, onSelect }: Props) {
  const { t } = useTranslation();

  if (units.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
        {t('units.noResults')}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 2,
      }}
    >
      {units.map((unit) => (
        <UnitCard
          key={unit.id}
          unit={unit}
          isOutOfYear={isOutOfYear(unit)}
          onClick={() => onSelect(unit)}
        />
      ))}
    </Box>
  );
}
