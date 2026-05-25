/**
 * UnitCard — compact card displaying a unit's key stats.
 * Renders at reduced opacity when the unit is outside the selected year range (FR-019).
 */
import { Card, CardActionArea, CardContent, Typography, Chip, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Unit } from '../../types/unit';

interface Props {
  unit: Unit;
  isOutOfYear: boolean;
  onClick: () => void;
}

export default function UnitCard({ unit, isOutOfYear, onClick }: Props) {
  const { t } = useTranslation();
  return (
    <Card
      sx={{
        opacity: isOutOfYear ? 0.38 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {unit.name}
            </Typography>
            <Chip label={`${unit.cost} pts`} size="small" color="secondary" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
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
