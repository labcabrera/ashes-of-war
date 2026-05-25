/**
 * WeaponList - renders the weapon catalogue as selectable cards or a table.
 */
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
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
      {weapons.map((weapon) => (
        <Card
          key={weapon.id}
          sx={{
            minHeight: 166,
            border: 2,
            borderColor: selectedId === weapon.id ? 'secondary.main' : 'transparent',
          }}
        >
          <CardActionArea
            onClick={() => onSelect(weapon)}
            aria-pressed={selectedId === weapon.id}
            sx={{ height: '100%' }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {weapon.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                <Chip label={t(`weapons.types.${weapon.type}`)} size="small" color="secondary" />
                <Chip
                  label={t('weapons.profileCount', { count: weapon.profiles.length })}
                  size="small"
                  variant="outlined"
                />
                <Chip label={weapon.profiles[0]?.rangeModifier} size="small" variant="outlined" />
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}
