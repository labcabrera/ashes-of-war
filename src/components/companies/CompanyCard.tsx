/**
 * CompanyCard displays a company catalogue entry.
 */
import { Box, Card, CardActionArea, CardContent, CardMedia, Chip, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { CompanyType } from '../../types/company';
import { factionColor } from '../../utils/factionColors';
import { factionFlagUrl, unitTypeIconUrl } from '../../utils/images';

interface Props {
  company: CompanyType;
  onClick: () => void;
}

export default function CompanyCard({ company, onClick }: Props) {
  const { t } = useTranslation();
  const factionLabel = t(`factions.${company.faction}`, company.faction);
  const requiredRules = company.rules.filter((rule) => rule.min > 0).length;
  const supportRules = company.rules.filter((rule) => rule.role === 'support').length;

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#1a1c20',
        backgroundImage: [
          'radial-gradient(ellipse at 12% 15%, rgba(184,152,92,0.10) 0%, transparent 38%)',
          'radial-gradient(ellipse at 88% 8%, rgba(140,112,64,0.08) 0%, transparent 35%)',
          'repeating-linear-gradient(115deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)',
        ].join(', '),
        paddingTop: 0,
        border: '1px solid #4a4030',
        boxShadow: 'inset 0 0 24px rgba(0,0,0,0.55)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 'inset 0 0 24px rgba(0,0,0,0.55), 0 8px 18px rgba(0,0,0,0.45)',
          borderColor: 'secondary.main',
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', flex: 1 }}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ height: 150, display: 'grid', placeItems: 'center', bgcolor: 'rgba(10, 12, 10, 0.68)' }}>
            <CardMedia
              component="img"
              image={unitTypeIconUrl(company.classification)}
              alt=""
              aria-hidden="true"
              sx={{ width: 118, height: 118, objectFit: 'contain', filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.5))' }}
            />
          </Box>
          <Chip
            label={t(`units.types.${company.classification}`)}
            size="small"
            color="secondary"
            sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 700 }}
          />
        </Box>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, p: 2, '&:last-child': { pb: 2 } }}>
          <Tooltip title={company.name}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '1rem' }}>
              {company.name}
            </Typography>
          </Tooltip>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src={factionFlagUrl(company.faction)}
              alt=""
              aria-hidden="true"
              sx={{ height: 18, width: 26, objectFit: 'cover', borderRadius: 0.5, flexShrink: 0 }}
            />
            <Typography variant="body2" color="text.secondary" noWrap>
              {factionLabel}
            </Typography>
            <Box
              aria-hidden="true"
              sx={{ ml: 'auto', width: 10, height: 10, borderRadius: '50%', bgcolor: factionColor(company.faction), flexShrink: 0 }}
            />
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {company.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 'auto' }}>
            <Chip label={t('companies.cards.required', { count: requiredRules })} size="small" variant="outlined" />
            <Chip label={t('companies.cards.support', { count: supportRules })} size="small" variant="outlined" />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
