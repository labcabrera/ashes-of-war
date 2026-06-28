/**
 * UnitFullPage - full-page extended view for one unit.
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
import AssignmentIcon from '@mui/icons-material/Assignment';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DescriptionIcon from '@mui/icons-material/Description';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FlightIcon from '@mui/icons-material/Flight';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GroupsIcon from '@mui/icons-material/Groups';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { useState, type ReactNode } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UnitCompareDialog from '../components/units/UnitCompareDialog';
import { infantryUnits } from '../data/infantry';
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

type SourceJson = Record<string, unknown> & { id: string };
const unitSources = infantryUnits as unknown as SourceJson[];

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

function checkValue(value?: number) {
  return value === undefined ? '-' : `${value}+`;
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

function ProfileStat({
  label,
  value,
  icon: Icon,
  emphasis = false,
}: {
  label: string;
  value: string | number;
  icon: typeof MilitaryTechIcon;
  emphasis?: boolean;
}) {
  return (
    <Box
      sx={{
        borderLeft: 3,
        borderColor: emphasis ? 'secondary.main' : 'divider',
        bgcolor: emphasis ? 'rgba(197, 167, 106, 0.07)' : 'transparent',
        px: { xs: 1.25, sm: 1.5 },
        py: { xs: 1.25, sm: 1.5 },
        minHeight: emphasis ? 112 : 78,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: emphasis ? 'secondary.main' : 'text.secondary' }}>
        <Icon sx={{ fontSize: emphasis ? 24 : 20 }} />
        <Typography
          variant="caption"
          sx={{ fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        variant={emphasis ? 'h3' : 'h5'}
        sx={{
          mt: 1,
          fontWeight: 900,
          lineHeight: 1,
          color: emphasis ? 'secondary.light' : 'text.primary',
          letterSpacing: 0,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function UnitProfileSection({ unit }: { unit: Unit }) {
  const { t } = useTranslation();

  return (
    <Section title={t('units.detail.gameProfile')} icon={AssignmentIcon}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: { xs: 1, sm: 1.5 },
          mb: 2,
        }}
      >
        <ProfileStat label={t('units.detail.resilience')} value={checkValue(unit.resilience)} icon={ShieldIcon} emphasis />
        <ProfileStat label={t('units.detail.recover')} value={checkValue(unit.recover)} icon={VolunteerActivismIcon} emphasis />
        <ProfileStat label={t('units.detail.morale')} value={checkValue(unit.morale)} icon={PsychologyAltIcon} emphasis />
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: { xs: 1, sm: 1.5 },
        }}
      >
        <ProfileStat label={t('common.cost')} value={`${unit.cost} pts`} icon={MilitaryTechIcon} />
        <ProfileStat label={t('units.detail.hitPoints')} value={unit.hitPoints} icon={GpsFixedIcon} />
        {unit.type === 'infantry' && (
          <ProfileStat label={t('units.detail.members')} value={unit.members} icon={GroupsIcon} />
        )}
        {unit.type === 'infantry' && (
          <ProfileStat label={t('units.detail.baseCount')} value={unit.baseCount} icon={AssignmentIcon} />
        )}
      </Box>
      {unit.resourceCosts && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          useFlexGap
          sx={{ mt: 2, flexWrap: 'wrap', alignItems: { xs: 'stretch', sm: 'center' } }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ mr: { sm: 0.5 }, letterSpacing: '0.06em' }}>
            {t('units.detail.resources')}
          </Typography>
          {Object.entries(unit.resourceCosts).map(([resource, cost]) => (
            <Chip key={resource} label={`${t(`army.resources.${resource}`)}: ${cost}`} size="small" />
          ))}
        </Stack>
      )}
    </Section>
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

function SourceJsonSection({ source }: { source: unknown }) {
  const { t } = useTranslation();
  const sourceJson = JSON.stringify(source, null, 2);

  return (
    <Accordion disableGutters>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="unit-source-json-content"
        id="unit-source-json-header"
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
  const unitSource = unitSources.find((source) => source.id === unit.id);
  const sourceJson = unitSource ?? vehicleEntry ?? unit;
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

        <UnitProfileSection unit={unit} />

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

        <SourceJsonSection source={sourceJson} />
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
