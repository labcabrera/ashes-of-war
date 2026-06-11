/**
 * UnitCard - displays a unit's portrait and key stats; clicking opens its full detail page.
 * Renders at reduced opacity when the unit is outside the selected year range (FR-019).
 */
import { Box, Card, CardActionArea, CardContent, CardMedia, Chip, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Unit } from '../../types/unit';
import { factionColor } from '../../utils/factionColors';
import { factionFlagUrl, unitImageUrl } from '../../utils/images';

interface Props {
  unit: Unit;
  isOutOfYear: boolean;
  onClick: () => void;
}

export default function UnitCard({ unit, isOutOfYear, onClick }: Props) {
  const { t } = useTranslation();
  const flagUrl = factionFlagUrl(unit.faction);
  const factionLabel = t(`factions.${unit.faction}`, unit.faction);
  const [topImageUrl, setTopImageUrl] = useState(unitImageUrl(unit.faction, unit.id));
  const isFlagFallback = topImageUrl === flagUrl;

  return (
    <Card
      sx={{
        opacity: isOutOfYear ? 0.45 : 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          borderColor: 'secondary.main',
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', flex: 1 }}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height={160}
            image={topImageUrl}
            alt=""
            aria-hidden="true"
            onError={() => setTopImageUrl(flagUrl)}
            sx={{
              objectFit: isFlagFallback ? 'contain' : 'cover',
              p: isFlagFallback ? 2 : 0,
              bgcolor: 'background.default',
              transition: 'transform 0.3s ease',
              ...(isFlagFallback ? {} : { '.MuiCardActionArea-root:hover &': { transform: 'scale(1.06)' } }),
            }}
          />
          <Chip
            label={`${unit.cost} pts`}
            size="small"
            color="secondary"
            sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 700 }}
          />
        </Box>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, p: 2, '&:last-child': { pb: 2 } }}>
          <Tooltip title={unit.name}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                lineHeight: 1.25,
                fontSize: '1rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {unit.name}
            </Typography>
          </Tooltip>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src={flagUrl}
              alt=""
              aria-hidden="true"
              sx={{ height: 18, width: 'auto', borderRadius: 0.5, flexShrink: 0 }}
            />
            <Typography variant="body2" color="text.secondary" noWrap>
              {factionLabel}
            </Typography>
            <Box
              aria-hidden="true"
              sx={{
                ml: 'auto',
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: factionColor(unit.faction),
                flexShrink: 0,
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center', mt: 'auto' }}>
            <Chip label={t(`units.types.${unit.type}`)} size="small" variant="outlined" />
            <Chip
              label={`${unit.from}–${unit.to}`}
              size="small"
              variant="outlined"
              color={isOutOfYear ? 'warning' : 'default'}
            />
          </Box>

          {isOutOfYear && (
            <Typography variant="caption" color="warning.main" sx={{ display: 'block' }}>
              {t('units.outOfYear')}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
