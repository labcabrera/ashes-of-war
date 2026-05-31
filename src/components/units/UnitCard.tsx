/**
 * UnitCard - selectable card displaying a unit's key stats.
 * Renders at reduced opacity when the unit is outside the selected year range (FR-019).
 */
import { Card, CardActionArea, CardContent, CardMedia, Typography, Chip, Box } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Unit } from '../../types/unit';
import { factionFlagUrl, unitImageUrl } from '../../utils/images';

interface Props {
  unit: Unit;
  isOutOfYear: boolean;
  selected: boolean;
  onClick: () => void;
}

const FACTION_FLAGS: Record<string, string> = {
  german: factionFlagUrl('german'),
  'soviet-union': factionFlagUrl('soviet-union'),
};

export default function UnitCard({ unit, isOutOfYear, selected, onClick }: Props) {
  const { t } = useTranslation();
  const flagUrl = FACTION_FLAGS[unit.faction];
  const factionLabel = t(`factions.${unit.faction}`, unit.faction);
  const [topImageUrl, setTopImageUrl] = useState(unitImageUrl(unit.faction, unit.id));

  return (
    <Card
      sx={{
        opacity: isOutOfYear ? 0.38 : 1,
        display: 'flex',
        flexDirection: 'column',
        border: 2,
        borderColor: selected ? 'secondary.main' : 'transparent',
        transition: 'opacity 0.2s, border-color 0.2s',
      }}
    >
      <CardActionArea
        onClick={onClick}
        aria-pressed={selected}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', flex: 1 }}
      >
        {topImageUrl && (
          <CardMedia
            component="img"
            height={140}
            image={topImageUrl}
            alt=""
            aria-hidden="true"
            onError={() => flagUrl && setTopImageUrl(flagUrl)}
            sx={{
              objectFit: topImageUrl === flagUrl ? 'contain' : 'cover',
              p: topImageUrl === flagUrl ? 1.5 : 0,
              bgcolor: 'background.default',
            }}
          />
        )}
        <CardContent sx={{ flex: 1, p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, pr: 1, lineHeight: 1.2, fontSize: '1rem' }}>
              {unit.name}
            </Typography>
            <Chip label={`${unit.cost} pts`} size="small" color="secondary" sx={{ flexShrink: 0 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
            {flagUrl && (
              <Box
                component="img"
                src={flagUrl}
                alt={factionLabel}
                title={factionLabel}
                sx={{ height: 20, width: 'auto', borderRadius: 0.5, flexShrink: 0 }}
              />
            )}
            <Chip label={t(`units.types.${unit.type}`)} size="small" variant="outlined" />
            <Chip
              label={`${unit.from}\u2013${unit.to}`}
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
