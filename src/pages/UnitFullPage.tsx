/**
 * UnitFullPage - full-page extended view for one unit.
 */
import {
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
import AssignmentIcon from '@mui/icons-material/Assignment';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DescriptionIcon from '@mui/icons-material/Description';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FlightIcon from '@mui/icons-material/Flight';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import { useState, type ReactNode } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UnitCompareDialog from '../components/units/UnitCompareDialog';
import { allUnits } from '../data/units';
import { vehicles } from '../data/vehicles';
import { towedWeapons } from '../data/towed';
import { allWeapons } from '../data/weapons';
import { getDescription } from '../i18n/descriptions';
import type { Armor, Unit, UnitType, UnitWeapon } from '../types/unit';
import type { VehicleCatalogueEntry } from '../types/vehicle';
import { unitImageUrl } from '../utils/images';
import { formatUnitKeyword } from '../utils/unitKeywords';

const UNIT_ICONS = {
  infantry: MilitaryTechIcon,
  tank: DirectionsCarIcon,
  'tank-destroyer': DirectionsCarIcon,
  'assault-gun': DirectionsCarIcon,
  'sp-artillery': GpsFixedIcon,
  'sp-anti-aircraft': GpsFixedIcon,
  mechanised: DirectionsCarIcon,
  motorised: DirectionsCarIcon,
  'towed-artillery': GpsFixedIcon,
  'towed-anti-tank': GpsFixedIcon,
  'towed-anti-aircraft': GpsFixedIcon,
  aircraft: FlightIcon,
} satisfies Record<UnitType, typeof MilitaryTechIcon>;

const units = allUnits;
const weapons = allWeapons;
const vehicleCatalogue = [...vehicles, ...towedWeapons];

function getWeapon(assignment: UnitWeapon) {
  return weapons.find((weapon) => weapon.id === assignment.id);
}

function weaponLabel(assignment: UnitWeapon) {
  return `${assignment.count} x ${getWeapon(assignment)?.name ?? assignment.id}`;
}

function weaponHref(weaponId: string) {
  return `/units?tab=weapons&weapon=${encodeURIComponent(weaponId)}`;
}

function armorRows(armorProfile: NonNullable<Unit['armor']>): Array<[string, Armor]> {
  return [
    ['front', armorProfile.front],
    ['side', armorProfile.side],
    ['rear', armorProfile.rear],
    ['exposed', armorProfile.exposed],
  ];
}

function movementValue(value: number) {
  return `${value}'`;
}

function isNonVehicleUnit(unit: Unit) {
  return !unit.armor;
}

/** Card-like container for a labeled group of unit details. */
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

function WeaponAssignments({ assignments }: { assignments: UnitWeapon[] }) {
  const { t } = useTranslation();

  if (assignments.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('units.detail.unarmed')}
      </Typography>
    );
  }

  return (
    <Stack spacing={1.25}>
      {assignments.map((assignment) => {
        const weapon = getWeapon(assignment);
        return (
          <Box key={`${assignment.type}-${assignment.id}`} sx={{ borderTop: 1, borderColor: 'divider', pt: 1.25 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
              <Box>
                <Button
                  component={RouterLink}
                  to={weaponHref(assignment.id)}
                  endIcon={<OpenInNewIcon fontSize="small" />}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none', px: 0, fontWeight: 700 }}
                >
                  {weaponLabel(assignment)}
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {t('units.weaponMounts.' + assignment.type)}
                </Typography>
              </Box>
              {weapon?.rateOfFirePerMinute && (
                <Chip
                  label={`${t('weapons.rateOfFire')}: ${weapon.rateOfFirePerMinute.combat.min}-${weapon.rateOfFirePerMinute.combat.max}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
            {weapon && (
              <TableContainer sx={{ mt: 1 }}>
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
            )}
          </Box>
        );
      })}
    </Stack>
  );
}

function HistoricalSpecsSection({ unit, entry }: { unit: Unit; entry?: VehicleCatalogueEntry }) {
  const { t } = useTranslation();
  const historical = entry?.historical;

  const fields: Array<{ label: string; value: string }> = [];
  if (historical?.crew !== undefined) {
    fields.push({ label: t('units.detail.historical.crew'), value: String(historical.crew) });
  }
  if (historical?.combatWeightTons !== undefined) {
    fields.push({ label: t('units.detail.historical.weight'), value: `${historical.combatWeightTons} t` });
  }
  if (historical?.engine) {
    fields.push({ label: t('units.detail.historical.engine'), value: historical.engine });
  }
  if (historical?.manufacturer) {
    fields.push({
      label: t('units.detail.historical.manufacturer'),
      value: historical.modelFamily ? `${historical.manufacturer} (${historical.modelFamily})` : historical.manufacturer,
    });
  }
  if (historical?.productionStart !== undefined || historical?.productionEnd !== undefined) {
    fields.push({
      label: t('units.detail.historical.production'),
      value: `${historical.productionStart ?? '?'}-${historical.productionEnd ?? '?'}`,
    });
  }
  if (historical?.unitsBuilt !== undefined) {
    fields.push({ label: t('units.detail.historical.unitsBuilt'), value: historical.unitsBuilt.toLocaleString() });
  }

  const speedRows = historical?.speedKmh
    ? ([
        ['road', historical.speedKmh.road],
        ['offRoad', historical.speedKmh.offRoad],
        ['sustainedMarch', historical.speedKmh.sustainedMarch],
      ] as const)
    : [];

  const armorEntries = unit.armor ? armorRows(unit.armor) : [];

  if (fields.length === 0 && speedRows.length === 0 && armorEntries.length === 0 && !historical?.sourceUrl) {
    return null;
  }

  const hasFooter = Boolean(historical?.sourceUrl);

  return (
    <Section title={t('units.detail.historical.title')} icon={HistoryEduIcon}>
      {(speedRows.length > 0 || fields.length > 0) && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
            mb: armorEntries.length > 0 || hasFooter ? 2 : 0,
          }}
        >
          {speedRows.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('units.detail.historical.speed')}
              </Typography>
              <Stack>
                {speedRows.map(([key, value]) => (
                  <Typography key={key} variant="body1">
                    {t(`units.detail.historical.${key}`)}: {value} km/h
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
          {fields.map((field) => (
            <Box key={field.label}>
              <Typography variant="caption" color="text.secondary">
                {field.label}
              </Typography>
              <Typography variant="body1">{field.value}</Typography>
            </Box>
          ))}
        </Box>
      )}
      {armorEntries.length > 0 && (
        <Box sx={{ mb: hasFooter ? 2 : 0 }}>
          <Typography variant="caption" color="text.secondary">
            {t('units.detail.historical.armour')}
          </Typography>
          <Stack>
            {armorEntries.map(([facing, armor]) => (
              <Typography key={facing} variant="body1">
                {t(`units.detail.${facing}`)}: {armor.armorMM} mm · {armor.armorInclination}°
                {armor.notes ? ` — ${armor.notes}` : ''}
              </Typography>
            ))}
          </Stack>
        </Box>
      )}
      {historical?.sourceUrl && (
        <Button
          component={MuiLink}
          href={historical.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewIcon fontSize="small" />}
          sx={{ textTransform: 'none', px: 0 }}
        >
          {t('units.detail.historical.source')}
        </Button>
      )}
    </Section>
  );
}

export default function UnitFullPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { unitId } = useParams();
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const unit = units.find((candidate) => candidate.id === unitId);
  const UnitIcon = unit ? UNIT_ICONS[unit.type] : MilitaryTechIcon;

  if (!unit) {
    return (
      <Container maxWidth="lg">
        <Button component={RouterLink} to="/units" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          {t('units.detail.backToCatalogue')}
        </Button>
        <Typography variant="h4">{t('units.detail.notFound')}</Typography>
      </Container>
    );
  }

  const assignedWeapons = unit.weapons ?? [];
  const vehicleEntry = vehicleCatalogue.find((vehicle) => vehicle.id === unit.id);
  const description =
    getDescription('units', unit.id, i18n.resolvedLanguage) ??
    getDescription('types', unit.type, i18n.resolvedLanguage);

  return (
    <Container maxWidth="lg">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', mb: 2 }}>
        <Button component={RouterLink} to="/units" startIcon={<ArrowBackIcon />} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
          {t('units.detail.backToCatalogue')}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<CompareArrowsIcon />}
          onClick={() => setCompareDialogOpen(true)}
          sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
        >
          {t('units.compare.action')}
        </Button>
      </Stack>

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
              src={unitImageUrl(unit.faction, unit.id)}
              alt={unit.name}
              sx={{
                width: '100%',
                height: { xs: 260, md: '100%' },
                borderRadius: 0,
                bgcolor: 'primary.dark',
                '& img': { objectFit: 'cover' },
              }}
            >
              <UnitIcon sx={{ fontSize: 144, color: 'secondary.main' }} />
            </Avatar>
            <Box sx={{ p: { xs: 3, md: 4 }, color: 'primary.contrastText' }}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
                {unit.name}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Chip label={t(`units.types.${unit.type}`)} />
                <Chip label={t(`factions.${unit.faction}`, unit.faction)} />
                <Chip label={`${unit.cost} pts`} color="secondary" />
                <Chip label={`${unit.from}-${unit.to}`} variant="outlined" sx={{ color: 'inherit', borderColor: 'currentColor' }} />
              </Stack>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '0.85fr 1.15fr' }, gap: 3, alignItems: 'start' }}>
          <Stack spacing={3}>
            <Section title={t('units.detail.movement.title')} icon={SpeedIcon}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('units.detail.movement.speed')}</TableCell>
                      <TableCell align="right">{t('units.detail.movement.road')}</TableCell>
                      <TableCell align="right">{t('units.detail.movement.crossCountry')}</TableCell>
                      <TableCell align="right">{t('units.detail.movement.rough')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(['tactical', 'cruise', 'dash'] as const).map((speed) => (
                      <TableRow key={speed}>
                        <TableCell>{t(`units.detail.movement.${speed}`)}</TableCell>
                        <TableCell align="right">{movementValue(unit.movement[speed].road)}</TableCell>
                        <TableCell align="right">{movementValue(unit.movement[speed].crossCountry)}</TableCell>
                        <TableCell align="right">{movementValue(unit.movement[speed].rough)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Section>

            <Section title={t('units.detail.summary')} icon={AssignmentIcon}>
              <Stack spacing={2}>
                {unit.resourceCosts && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: '0.06em' }}>
                      {t('units.detail.resources')}
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      {Object.entries(unit.resourceCosts).map(([resource, cost]) => (
                        <Chip key={resource} label={`${t(`army.resources.${resource}`)}: ${cost}`} />
                      ))}
                    </Stack>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: '0.06em' }}>
                    {t('units.detail.thresholds')}
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                    <Chip
                      label={`${t('units.detail.resilience')}: ${unit.resilience}`}
                      color="secondary"
                      variant="outlined"
                    />
                    {isNonVehicleUnit(unit) && (
                      <Chip
                        label={`${t('units.detail.casualtiesThreshold')}: ${unit.casualtiesThreshold}`}
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                    {unit.type === 'infantry' && (
                      <Chip
                        label={`${t('units.detail.members')}: ${unit.members}`}
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Section>

            {unit.armor && (
              <Section title={t('units.detail.armour')} icon={ShieldIcon}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('units.detail.armourFacing')}</TableCell>
                        <TableCell align="right">{t('units.detail.armourValue')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {armorRows(unit.armor).map(([facing, armor]) => (
                        <TableRow key={facing}>
                          <TableCell>{t(`units.detail.${facing}`)}</TableCell>
                          <TableCell align="right">{armor.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Section>
            )}
          </Stack>

          <Stack spacing={3}>
            <Section title={t('units.detail.weapons')} icon={GpsFixedIcon}>
              <WeaponAssignments assignments={assignedWeapons} />
            </Section>

            {unit.keywords && unit.keywords.length > 0 && (
              <Section title={t('units.detail.keywords')} icon={BookmarksIcon}>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {unit.keywords.map((keyword) => (
                    <Chip key={keyword} label={formatUnitKeyword(keyword, t)} color="warning" />
                  ))}
                </Stack>
              </Section>
            )}
          </Stack>
        </Box>

        <HistoricalSpecsSection unit={unit} entry={vehicleEntry} />

        {description && (
          <Section title={t('units.detail.description')} icon={DescriptionIcon}>
            <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {description}
            </Typography>
          </Section>
        )}
      </Stack>
      <UnitCompareDialog
        open={compareDialogOpen}
        unit={unit}
        units={units}
        onClose={() => setCompareDialogOpen(false)}
        onView={(target) => {
          setCompareDialogOpen(false);
          navigate(`/units/${encodeURIComponent(unit.id)}/compare/${encodeURIComponent(target.id)}`);
        }}
      />
    </Container>
  );
}
