/**
 * WeaponList - renders the weapon catalogue as selectable cards or a table.
 */
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Weapon } from '../../types/weapon';

interface Props {
  weapons: Weapon[];
  selectedId: string | null;
  viewMode: 'cards' | 'table';
  onSelect: (weapon: Weapon) => void;
}

const FACTION_FLAGS: Record<string, string> = {
  german: '/images/factions/germany.jpg',
  'soviet-union': '/images/factions/soviet-union.jpg',
};

function getWeaponFaction(id: string): string {
  if (id.startsWith('german-')) return 'german';
  if (id.startsWith('soviet-union-') || id.startsWith('su-')) return 'soviet-union';
  return '';
}

export default function WeaponList({ weapons, selectedId, viewMode, onSelect }: Props) {
  const { t } = useTranslation();

  if (weapons.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
        {t('weapons.noResults')}
      </Typography>
    );
  }

  if (viewMode === 'table') {
    return (
      <TableContainer component={Paper}>
        <Table size="small" aria-label={t('catalogue.tabs.weapons')}>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.name')}</TableCell>
              <TableCell>{t('common.type')}</TableCell>
              <TableCell align="right">{t('weapons.profiles')}</TableCell>
              <TableCell>{t('weapons.range')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {weapons.map((weapon) => (
              <TableRow key={weapon.id} selected={selectedId === weapon.id}>
                <TableCell>
                  <Button
                    onClick={() => onSelect(weapon)}
                    aria-pressed={selectedId === weapon.id}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  >
                    {weapon.name}
                  </Button>
                </TableCell>
                <TableCell>{t(`weapons.types.${weapon.type}`)}</TableCell>
                <TableCell align="right">{weapon.profiles.length}</TableCell>
                <TableCell>{weapon.profiles[0]?.rangeModifier}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
        gap: 2.5,
      }}
    >
      {weapons.map((weapon) => {
        const faction = getWeaponFaction(weapon.id);
        const flagUrl = FACTION_FLAGS[faction];
        const factionLabel = t(`factions.${faction}`, faction);
        const topImageUrl = weapon.imageUrl ?? flagUrl;
        const isFlag = !weapon.imageUrl && !!flagUrl;
        return (
          <Card
            key={weapon.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              border: 2,
              borderColor: selectedId === weapon.id ? 'secondary.main' : 'transparent',
              transition: 'border-color 0.2s',
            }}
          >
            <CardActionArea
              onClick={() => onSelect(weapon)}
              aria-pressed={selectedId === weapon.id}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', flex: 1 }}
            >
              {topImageUrl && (
                <CardMedia
                  component="img"
                  height={isFlag ? 100 : 140}
                  image={topImageUrl}
                  alt=""
                  aria-hidden="true"
                  sx={{
                    objectFit: isFlag ? 'contain' : 'cover',
                    p: isFlag ? 1.5 : 0,
                    bgcolor: 'background.default',
                  }}
                />
              )}
              <CardContent sx={{ flex: 1, p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 1.5 }}>
                  {weapon.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                  {flagUrl && (
                    <Box
                      component="img"
                      src={flagUrl}
                      alt={factionLabel}
                      title={factionLabel}
                      sx={{ height: 14, width: 'auto', borderRadius: 0.5, flexShrink: 0 }}
                    />
                  )}
                  <Chip label={t(`weapons.types.${weapon.type}`)} size="small" color="secondary" />
                  <Chip
                    label={t('weapons.profileCount', { count: weapon.profiles.length })}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
    </Box>
  );
}
