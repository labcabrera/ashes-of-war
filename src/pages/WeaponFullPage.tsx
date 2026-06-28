/**
 * WeaponFullPage - full-page extended view for one weapon.
 */
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Link as MuiLink,
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ScienceIcon from '@mui/icons-material/Science';
import SpeedIcon from '@mui/icons-material/Speed';
import { type ReactNode } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { allUnits } from '../data/units';
import { allWeapons, weaponCatalogueEntries } from '../data/weapons';
import { getDescription } from '../i18n/descriptions';
import type { Unit, UnitWeapon } from '../types/unit';
import type { Weapon } from '../types/weapon';
import { factionFlagUrl, weaponFactionId, weaponImageUrl } from '../utils/images';

const weapons = allWeapons;
const units = allUnits;
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

function weaponImageFallback(weapon: Weapon) {
  const faction = weaponFactionId(weapon.id);
  return faction ? factionFlagUrl(faction) : undefined;
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof MilitaryTechIcon; children: ReactNode }) {
  return (
    <Paper sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}
      >
        <Icon sx={{ fontSize: 20, color: 'secondary.main' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Paper>
  );
}

function SourceJsonSection({ source }: { source: unknown }) {
  const { t } = useTranslation();
  const sourceJson = JSON.stringify(source, null, 2);

  return (
    <Accordion disableGutters>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="weapon-source-json-content"
        id="weapon-source-json-header"
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <DataObjectIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {t('units.detail.sourceJson')}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 2,
            maxHeight: 480,
            overflow: 'auto',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.default',
            color: 'text.secondary',
            fontFamily: 'monospace',
            fontSize: '0.8125rem',
            lineHeight: 1.55,
            whiteSpace: 'pre',
          }}
        >
          {sourceJson}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

function WeaponProfilesSection({ weapon }: { weapon: Weapon }) {
  const { t } = useTranslation();
  const hasPenetration = weapon.profiles.some((profile) => profile.armourPenetration !== undefined);
  const hasSuppression = weapon.profiles.some((profile) => profile.suppressionModifier !== undefined);
  const hasCharacteristics = weapon.profiles.some((profile) => profile.characteristics?.length);

  return (
    <Section title={t('weapons.gameDetails')} icon={GpsFixedIcon}>
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
    </Section>
  );
}

function HistoricalSection({ weapon }: { weapon: Weapon }) {
  const { t } = useTranslation();
  const historical = catalogueEntriesById.get(weapon.id)?.historical;
  const ammunitionEntries = Object.entries(historical?.ammunition ?? {});

  if (!historical) return null;

  return (
    <Section title={t('weapons.technicalDetails')} icon={ScienceIcon}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {historical.caliberMM !== undefined && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t('weapons.caliber')}
            </Typography>
            <Typography variant="body1">{historical.caliberMM} mm</Typography>
          </Box>
        )}
        {historical.barrelLength && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t('weapons.barrelLength')}
            </Typography>
            <Typography variant="body1">{historical.barrelLength}</Typography>
          </Box>
        )}
        {historical.mounting?.length && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t('weapons.mounting')}
            </Typography>
            <Typography variant="body1">{historical.mounting.join(' · ')}</Typography>
          </Box>
        )}
        {historical.typicalAmmunition?.length && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t('weapons.ammunition')}
            </Typography>
            <Typography variant="body1">{historical.typicalAmmunition.join(' · ')}</Typography>
          </Box>
        )}
        {historical.rateOfFirePerMinute && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t('weapons.rateOfFire')}
            </Typography>
            <Typography variant="body1">
              {t('weapons.theoretical')}: {formatRate(
                historical.rateOfFirePerMinute.theoretical.min,
                historical.rateOfFirePerMinute.theoretical.max,
              )} / {t('weapons.combat')}:{' '}
              {formatRate(historical.rateOfFirePerMinute.combat.min, historical.rateOfFirePerMinute.combat.max)}
            </Typography>
          </Box>
        )}
      </Box>

      {ammunitionEntries.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('weapons.ammunitionProfiles')}
          </Typography>
          <Stack spacing={2}>
            {ammunitionEntries.map(([profileId, ammunition]) => (
              <Box key={profileId} sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {ammunition.name ?? profileId}
                </Typography>
                {ammunition.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {ammunition.description}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 1 }}>
                  {ammunition.projectileWeightKg !== undefined && (
                    <Chip label={`${t('weapons.projectileWeight')}: ${ammunition.projectileWeightKg} kg`} variant="outlined" />
                  )}
                  {ammunition.explosiveChargeKg !== undefined && (
                    <Chip label={`${t('weapons.explosiveCharge')}: ${ammunition.explosiveChargeKg} kg`} variant="outlined" />
                  )}
                  {ammunition.penetrationAngleDeg !== undefined && (
                    <Chip label={`${t('weapons.penetrationAngle')}: ${ammunition.penetrationAngleDeg}°`} variant="outlined" />
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
        </Box>
      )}

      {historical.notes && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
          {historical.notes}
        </Typography>
      )}
      {historical.sourceUrl && (
        <Button
          component={MuiLink}
          href={historical.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewIcon fontSize="small" />}
          sx={{ mt: 1.5, textTransform: 'none', px: 0 }}
        >
          {t('units.detail.historical.source')}
        </Button>
      )}
    </Section>
  );
}

function CarriedBySection({ weapon }: { weapon: Weapon }) {
  const { t } = useTranslation();
  const weaponUnits = units
    .map((unit) => ({ unit, count: unitWeaponCount(unit, weapon.id) }))
    .filter(({ count }) => count > 0);

  return (
    <Section title={t('weapons.carriedBy')} icon={MilitaryTechIcon}>
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
                sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textAlign: 'left', textOverflow: 'ellipsis' }}
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
    </Section>
  );
}

export default function WeaponFullPage() {
  const { t, i18n } = useTranslation();
  const { weaponId } = useParams();
  const weapon = weapons.find((candidate) => candidate.id === weaponId);

  if (!weapon) {
    return (
      <Container maxWidth="lg">
        <Button component={RouterLink} to="/units?tab=weapons" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          {t('units.detail.backToCatalogue')}
        </Button>
        <Typography variant="h4">{t('weapons.detail.title')}</Typography>
      </Container>
    );
  }

  const catalogueEntry = catalogueEntriesById.get(weapon.id);
  const description = getDescription('weapons', weapon.id, i18n.resolvedLanguage);
  const faction = weaponFactionId(weapon.id);
  const factionLabel = faction ? t(`factions.${faction}`, faction) : undefined;
  const imageUrl = weaponImageUrl(weapon.id) ?? weaponImageFallback(weapon);

  return (
    <Container maxWidth="lg">
      <Button component={RouterLink} to="/units?tab=weapons" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        {t('units.detail.backToCatalogue')}
      </Button>

      <Stack spacing={3}>
        <Paper sx={{ overflow: 'hidden' }}>
          <Box
            sx={{
              minHeight: 260,
              bgcolor: 'primary.dark',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 0.9fr) minmax(0, 1.4fr)' },
            }}
          >
            <Avatar
              variant="rounded"
              src={imageUrl}
              alt={weapon.name}
              sx={{
                width: '100%',
                height: { xs: 260, md: '100%' },
                borderRadius: 0,
                bgcolor: 'primary.dark',
                '& img': { objectFit: imageUrl === weaponImageFallback(weapon) ? 'contain' : 'cover', p: imageUrl === weaponImageFallback(weapon) ? 4 : 0 },
              }}
            >
              <GpsFixedIcon sx={{ fontSize: 144, color: 'secondary.main' }} />
            </Avatar>
            <Box sx={{ p: { xs: 3, md: 4 }, color: 'primary.contrastText' }}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
                {weapon.name}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Chip label={t(`weapons.types.${weapon.type}`)} />
                <Chip label={t('weapons.profileCount', { count: weapon.profiles.length })} color="secondary" />
                {factionLabel && <Chip label={factionLabel} variant="outlined" sx={{ color: 'inherit', borderColor: 'currentColor' }} />}
                {catalogueEntry?.historical.caliberMM !== undefined && (
                  <Chip label={`${catalogueEntry.historical.caliberMM} mm`} variant="outlined" sx={{ color: 'inherit', borderColor: 'currentColor' }} />
                )}
                {catalogueEntry?.historical.barrelLength && (
                  <Chip label={catalogueEntry.historical.barrelLength} variant="outlined" sx={{ color: 'inherit', borderColor: 'currentColor' }} />
                )}
              </Stack>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' }, gap: 3, alignItems: 'start' }}>
          <Stack spacing={3}>
            <WeaponProfilesSection weapon={weapon} />
            <HistoricalSection weapon={weapon} />
          </Stack>
          <Stack spacing={3}>
            {weapon.rateOfFirePerMinute && (
              <Section title={t('weapons.rateOfFire')} icon={SpeedIcon}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {t('weapons.combat')}: {formatRate(
                    weapon.rateOfFirePerMinute.combat.min,
                    weapon.rateOfFirePerMinute.combat.max,
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('weapons.theoretical')}: {formatRate(
                    weapon.rateOfFirePerMinute.theoretical.min,
                    weapon.rateOfFirePerMinute.theoretical.max,
                  )}
                </Typography>
              </Section>
            )}
            <CarriedBySection weapon={weapon} />
          </Stack>
        </Box>

        {description && (
          <Section title={t('weapons.description')} icon={MilitaryTechIcon}>
            <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {description}
            </Typography>
          </Section>
        )}

        <SourceJsonSection source={catalogueEntry ?? weapon} />
      </Stack>
    </Container>
  );
}
