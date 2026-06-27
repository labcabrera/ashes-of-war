/**
 * WeaponDetail - side panel presenting firing profiles for the selected weapon.
 */
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Unit, UnitWeapon } from '../../types/unit';
import { Weapon } from '../../types/weapon';
import { weaponCatalogueEntries } from '../../data/weapons';
import { getDescription } from '../../i18n/descriptions';

interface Props {
  weapon: Weapon | null;
  units: Unit[];
}

const catalogueEntriesById = new Map(weaponCatalogueEntries.map((entry) => [entry.id, entry]));

function weaponAssignments(unit: Unit): UnitWeapon[] {
  return unit.weapons ?? [];
}

function unitWeaponCount(unit: Unit, weaponId: string) {
  return weaponAssignments(unit)
    .filter((assignment) => assignment.id === weaponId)
    .reduce((total, assignment) => total + assignment.count, 0);
}

function formatRate(min: number, max: number) {
  return min === max ? String(min) : `${min}-${max}`;
}

export default function WeaponDetail({ weapon, units }: Props) {
  const { t, i18n } = useTranslation();
  const weaponUnits = weapon
    ? units
        .map((unit) => ({ unit, count: unitWeaponCount(unit, weapon.id) }))
        .filter(({ count }) => count > 0)
    : [];
  const description = weapon
    ? getDescription('weapons', weapon.id, i18n.resolvedLanguage)
    : undefined;
  const catalogueEntry = weapon ? catalogueEntriesById.get(weapon.id) : undefined;
  const historical = catalogueEntry?.historical;
  const ammunitionEntries = Object.entries(historical?.ammunition ?? {});
  const hasPenetration = Boolean(weapon?.profiles.some((profile) => profile.armourPenetration !== undefined));
  const hasSuppression = Boolean(weapon?.profiles.some((profile) => profile.suppressionModifier !== undefined));
  const hasCharacteristics = Boolean(weapon?.profiles.some((profile) => profile.characteristics?.length));

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
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Chip label={t(`weapons.types.${weapon.type}`)} color="secondary" size="small" />
              <Chip label={t('weapons.profileCount', { count: weapon.profiles.length })} size="small" variant="outlined" />
              {historical?.caliberMM !== undefined && (
                <Chip label={`${historical.caliberMM} mm`} size="small" variant="outlined" />
              )}
              {historical?.barrelLength && (
                <Chip label={historical.barrelLength} size="small" variant="outlined" />
              )}
            </Stack>

            {(historical?.mounting?.length || historical?.typicalAmmunition?.length) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  {t('weapons.technicalDetails')}
                </Typography>
                <Stack spacing={0.75}>
                  {historical.mounting?.length && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t('weapons.mounting')}
                      </Typography>
                      <Typography variant="body2">{historical.mounting.join(' · ')}</Typography>
                    </Box>
                  )}
                  {historical.typicalAmmunition?.length && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t('weapons.ammunition')}
                      </Typography>
                      <Typography variant="body2">{historical.typicalAmmunition.join(' · ')}</Typography>
                    </Box>
                  )}
                </Stack>
              </>
            )}

            {weapon.rateOfFirePerMinute && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">{t('weapons.rateOfFire')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('weapons.theoretical')}: {formatRate(
                    weapon.rateOfFirePerMinute.theoretical.min,
                    weapon.rateOfFirePerMinute.theoretical.max,
                  )} / {t('weapons.combat')}:{' '}
                  {formatRate(weapon.rateOfFirePerMinute.combat.min, weapon.rateOfFirePerMinute.combat.max)}
                </Typography>
              </>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              {t('weapons.gameDetails')}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('weapons.fireType')}</TableCell>
                    <TableCell align="right">{t('weapons.shots')}</TableCell>
                    <TableCell align="right">{t('weapons.hitOn')}</TableCell>
                    <TableCell>{t('weapons.range')}</TableCell>
                    {hasPenetration && <TableCell align="right">{t('weapons.penetration')}</TableCell>}
                    {hasSuppression && <TableCell align="right">{t('weapons.suppression')}</TableCell>}
                    {hasCharacteristics && <TableCell>{t('weapons.characteristics')}</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {weapon.profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>{profile.name}</TableCell>
                      <TableCell align="right">{profile.shots}</TableCell>
                      <TableCell align="right">{profile.hitOn}</TableCell>
                      <TableCell>{profile.rangeModifier}</TableCell>
                      {hasPenetration && <TableCell align="right">{profile.armourPenetration ?? '-'}</TableCell>}
                      {hasSuppression && <TableCell align="right">{profile.suppressionModifier ?? '-'}</TableCell>}
                      {hasCharacteristics && (
                        <TableCell>
                          {profile.characteristics?.length ? (
                            <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                              {profile.characteristics.map((characteristic) => (
                                <Chip key={characteristic} label={characteristic} size="small" variant="outlined" />
                              ))}
                            </Stack>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {ammunitionEntries.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  {t('weapons.ammunitionProfiles')}
                </Typography>
                <Stack spacing={1.5}>
                  {ammunitionEntries.map(([profileId, ammunition]) => (
                    <Box key={profileId}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {ammunition.name ?? profileId}
                      </Typography>
                      {ammunition.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                          {ammunition.description}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 1 }}>
                        {ammunition.projectileWeightKg !== undefined && (
                          <Chip
                            label={`${t('weapons.projectileWeight')}: ${ammunition.projectileWeightKg} kg`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {ammunition.explosiveChargeKg !== undefined && (
                          <Chip
                            label={`${t('weapons.explosiveCharge')}: ${ammunition.explosiveChargeKg} kg`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {ammunition.penetrationAngleDeg !== undefined && (
                          <Chip
                            label={`${t('weapons.penetrationAngle')}: ${ammunition.penetrationAngleDeg}°`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                      {ammunition.penetrationTable?.length && (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>{t('weapons.rangeMeters')}</TableCell>
                                <TableCell align="right">{t('weapons.penetrationMm')}</TableCell>
                                <TableCell align="right">{t('weapons.trainingHit')}</TableCell>
                                <TableCell align="right">{t('weapons.combatHit')}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {ammunition.penetrationTable.map((row) => (
                                <TableRow key={row.rangeM}>
                                  <TableCell>{row.rangeM}</TableCell>
                                  <TableCell align="right">{row.penetrationMM ?? '-'}</TableCell>
                                  <TableCell align="right">
                                    {row.hitProbabilityTraining !== undefined ? `${row.hitProbabilityTraining}%` : '-'}
                                  </TableCell>
                                  <TableCell align="right">
                                    {row.hitProbabilityCombat !== undefined ? `${row.hitProbabilityCombat}%` : '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </Box>
                  ))}
                </Stack>
              </>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              {t('weapons.carriedBy')}
            </Typography>
            {weaponUnits.length > 0 ? (
              <Stack spacing={0.75}>
                {weaponUnits.map(({ unit, count }) => (
                  <Button
                    key={unit.id}
                    component={RouterLink}
                    to={`/units/${encodeURIComponent(unit.id)}`}
                    variant="text"
                    size="small"
                    endIcon={<OpenInNewIcon fontSize="small" />}
                    sx={{
                      width: '100%',
                      justifyContent: 'space-between',
                      textTransform: 'none',
                      px: 0,
                      gap: 1,
                      '& .MuiButton-endIcon': { ml: 0 },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textAlign: 'left',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {unit.name}
                    </Box>
                    <Chip label={`x${count}`} size="small" variant="outlined" sx={{ flexShrink: 0 }} />
                  </Button>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('weapons.noCarriers')}
              </Typography>
            )}

            {description && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  {t('weapons.description')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {description}
                </Typography>
              </>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}
