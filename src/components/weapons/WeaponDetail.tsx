/**
 * WeaponDetail - side panel presenting firing profiles for the selected weapon.
 */
import {
  Box,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { useTranslation } from 'react-i18next';
import { Weapon } from '../../types/weapon';

interface Props {
  weapon: Weapon | null;
}

export default function WeaponDetail({ weapon }: Props) {
  const { t } = useTranslation();

  return (
    <Paper
      component="aside"
      aria-label={t('weapons.detail.title')}
      elevation={3}
      sx={{ minHeight: { xs: 280, lg: 520 }, position: { lg: 'sticky' }, top: { lg: 16 } }}
    >
      <Box
        sx={{
          height: 172,
          bgcolor: 'primary.dark',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <GpsFixedIcon sx={{ fontSize: 104, color: 'secondary.main' }} />
      </Box>

      <Box sx={{ p: 3 }}>
        {!weapon ? (
          <>
            <Typography variant="h6" gutterBottom>
              {t('weapons.detail.title')}
            </Typography>
            <Typography color="text.secondary">{t('weapons.detail.selectPrompt')}</Typography>
          </>
        ) : (
          <>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              {weapon.name}
            </Typography>
            <Chip label={t(`weapons.types.${weapon.type}`)} color="secondary" size="small" />

            {weapon.rateOfFirePerMinute && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">{t('weapons.rateOfFire')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('weapons.theoretical')}: {weapon.rateOfFirePerMinute.theoretical.min}-
                  {weapon.rateOfFirePerMinute.theoretical.max} / {t('weapons.combat')}:{' '}
                  {weapon.rateOfFirePerMinute.combat.min}-{weapon.rateOfFirePerMinute.combat.max}
                </Typography>
              </>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              {t('weapons.profiles')}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('weapons.profile')}</TableCell>
                    <TableCell align="right">{t('weapons.shots')}</TableCell>
                    <TableCell align="right">{t('weapons.hitOn')}</TableCell>
                    <TableCell>{t('weapons.range')}</TableCell>
                    <TableCell align="right">{t('weapons.penetration')}</TableCell>
                    <TableCell align="right">{t('weapons.suppression')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {weapon.profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>{profile.name}</TableCell>
                      <TableCell align="right">{profile.shots}</TableCell>
                      <TableCell align="right">{profile.hitOn}</TableCell>
                      <TableCell>{profile.rangeModifier}</TableCell>
                      <TableCell align="right">{profile.armourPenetration ?? '-'}</TableCell>
                      <TableCell align="right">{profile.suppressionModifier ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {weapon.profiles.some((profile) => profile.characteristics?.length) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  {t('weapons.characteristics')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {weapon.profiles.flatMap((profile) =>
                    (profile.characteristics ?? []).map((characteristic) => (
                      <Chip
                        key={`${profile.id}-${characteristic}`}
                        label={characteristic}
                        size="small"
                        variant="outlined"
                      />
                    )),
                  )}
                </Box>
              </>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}
