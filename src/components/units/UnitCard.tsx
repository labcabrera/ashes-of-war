/**
 * UnitCard - selectable card displaying a unit's key stats.
 * Renders at reduced opacity when the unit is outside the selected year range (FR-019).
 */
import { Card, CardActionArea, CardContent, Typography, Chip, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Unit } from '../../types/unit';

interface Props {
  unit: Unit;
  isOutOfYear: boolean;
  selected: boolean;
  onClick: () => void;
}

export default function UnitCard({ unit, isOutOfYear, selected, onClick }: Props) {
  const { t } = useTranslation();
  return (
    <Card
      sx={{
        opacity: isOutOfYear ? 0.38 : 1,
        minHeight: 176,
        border: 2,
        borderColor: selected ? 'secondary.main' : 'transparent',
        transition: 'opacity 0.2s, border-color 0.2s',
      }}
    >
      <CardActionArea onClick={onClick} aria-pressed={selected} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, pr: 1 }}>
              {unit.name}
            </Typography>
            <Chip label={`${unit.cost} pts`} size="small" color="secondary" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            <Chip label={t(`units.types.${unit.type}`)} size="small" variant="outlined" />
            <Chip label={unit.faction} size="small" variant="outlined" />
            <Chip
              label={`${unit.from}–${unit.to}`}
              size="small"
              variant="outlined"
              color={isOutOfYear ? 'warning' : 'default'}
            />
          </Box>
          {isOutOfYear && (
            <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
              {t('units.outOfYear')}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
