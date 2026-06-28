/**
 * UnitComparePage - side-by-side gameplay comparison for two catalogue units.
 */
import {
  Box,
  Button,
  Chip,
  Container,
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
import type { ReactNode } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { allUnits } from '../data/units';
import { allWeapons } from '../data/weapons';
import type { Armor, Unit, UnitWeapon } from '../types/unit';
import type { Weapon } from '../types/weapon';
import { areComparableUnits, unitComparisonCategory } from '../utils/unitComparison';
import { formatUnitKeyword } from '../utils/unitKeywords';

const units = allUnits;
const weapons = allWeapons;

function movementValue(value: number) {
  return `${value}'`;
}

function weaponById(id: string): Weapon | undefined {
  return weapons.find((weapon) => weapon.id === id);
}

function armourRows(unit: Unit): Array<[string, Armor | undefined]> {
  return [
    ['front', unit.armor?.front],
    ['side', unit.armor?.side],
    ['rear', unit.armor?.rear],
    ['exposed', unit.armor?.exposed],
  ];
}

function formatResources(unit: Unit, t: ReturnType<typeof useTranslation>['t']) {
  const resources = unit.resourceCosts ? Object.entries(unit.resourceCosts) : [];
  if (resources.length === 0) return '-';
  return resources.map(([resource, cost]) => `${t(`army.resources.${resource}`)}: ${cost}`).join(', ');
}

function formatKeywords(unit: Unit, t: ReturnType<typeof useTranslation>['t']) {
  if (!unit.keywords || unit.keywords.length === 0) return '-';
  return unit.keywords.map((keyword) => formatUnitKeyword(keyword, t)).join(', ');
}

function comparisonRows(unit: Unit, t: ReturnType<typeof useTranslation>['t']): Array<[string, string | number]> {
  const rows: Array<[string, string | number]> = [
    [t('common.type'), t(`units.types.${unit.type}`)],
    [t('common.faction'), t(`factions.${unit.faction}`, unit.faction)],
    [t('common.cost'), unit.cost],
    [t('units.detail.hitPoints'), unit.hitPoints],
    [t('units.detail.availability'), `${unit.from}-${unit.to}`],
    [t('units.detail.resilience'), unit.resilience],
    [t('units.detail.resources'), formatResources(unit, t)],
    [t('units.detail.keywords'), formatKeywords(unit, t)],
  ];

  if ('members' in unit) rows.splice(6, 0, [t('units.detail.members'), unit.members]);
  if ('baseCount' in unit) rows.splice(7, 0, [t('units.detail.baseCount'), unit.baseCount]);
  return rows;
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof CompareArrowsIcon; children: ReactNode }) {
  return (
    <Paper sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Icon sx={{ fontSize: 20, color: 'secondary.light' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Paper>
  );
}

function UnitHeader({ unit }: { unit: Unit }) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Stack spacing={1.5}>
        <Typography variant="h5" sx={{ fontWeight: 850 }}>
          {unit.name}
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Chip label={t(`units.types.${unit.type}`)} color="secondary" />
          <Chip label={t(`factions.${unit.faction}`, unit.faction)} />
          <Chip label={`${unit.cost} pts`} variant="outlined" />
          <Chip label={`${unit.from}-${unit.to}`} variant="outlined" />
        </Stack>
      </Stack>
    </Paper>
  );
}

function SummaryTable({ left, right }: { left: Unit; right: Unit }) {
  const { t } = useTranslation();
  const leftRows = comparisonRows(left, t);
  const rightRows = comparisonRows(right, t);
  const labels = [...new Set([...leftRows, ...rightRows].map(([label]) => label))];

  return (
    <Section title={t('units.compare.gameProfile')} icon={MilitaryTechIcon}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('units.compare.attribute')}</TableCell>
              <TableCell>{left.name}</TableCell>
              <TableCell>{right.name}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {labels.map((label) => (
              <TableRow key={label}>
                <TableCell sx={{ fontWeight: 700 }}>{label}</TableCell>
                <TableCell>{leftRows.find(([rowLabel]) => rowLabel === label)?.[1] ?? '-'}</TableCell>
                <TableCell>{rightRows.find(([rowLabel]) => rowLabel === label)?.[1] ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Section>
  );
}

function MovementTable({ left, right }: { left: Unit; right: Unit }) {
  const { t } = useTranslation();
  const speeds = ['tactical', 'cruise', 'dash'] as const;
  const terrains = ['road', 'crossCountry', 'rough'] as const;

  return (
    <Section title={t('units.detail.movement.title')} icon={SpeedIcon}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('units.detail.movement.speed')}</TableCell>
              <TableCell>{t('units.compare.terrain')}</TableCell>
              <TableCell align="right">{left.name}</TableCell>
              <TableCell align="right">{right.name}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {speeds.flatMap((speed) =>
              terrains.map((terrain) => (
                <TableRow key={`${speed}-${terrain}`}>
                  <TableCell>{t(`units.detail.movement.${speed}`)}</TableCell>
                  <TableCell>{t(`units.detail.movement.${terrain}`)}</TableCell>
                  <TableCell align="right">{movementValue(left.movement[speed][terrain])}</TableCell>
                  <TableCell align="right">{movementValue(right.movement[speed][terrain])}</TableCell>
                </TableRow>
              )),
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Section>
  );
}

function ArmourTable({ left, right }: { left: Unit; right: Unit }) {
  const { t } = useTranslation();
  if (!left.armor && !right.armor) return null;
  const rightRows = armourRows(right);

  return (
    <Section title={t('units.detail.armour')} icon={ShieldIcon}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('units.detail.armourFacing')}</TableCell>
              <TableCell align="right">{left.name}</TableCell>
              <TableCell align="right">{right.name}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {armourRows(left).map(([facing, leftArmor], index) => {
              const rightArmor = rightRows[index]?.[1];
              return (
                <TableRow key={facing}>
                  <TableCell>{t(`units.detail.${facing}`)}</TableCell>
                  <TableCell align="right">{leftArmor?.value ?? '-'}</TableCell>
                  <TableCell align="right">{rightArmor?.value ?? '-'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Section>
  );
}

function WeaponAssignment({ assignment }: { assignment: UnitWeapon }) {
  const { t } = useTranslation();
  const weapon = weaponById(assignment.id);

  return (
    <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.25 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', mb: weapon ? 1 : 0 }}>
        <Box>
          <Typography sx={{ fontWeight: 800 }}>
            {assignment.count} x {weapon?.name ?? assignment.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('units.weaponMounts.' + assignment.type)}
          </Typography>
        </Box>
        {weapon?.rateOfFirePerMinute && (
          <Chip
            size="small"
            variant="outlined"
            label={`${t('weapons.rateOfFire')}: ${weapon.rateOfFirePerMinute.combat.min}-${weapon.rateOfFirePerMinute.combat.max}`}
          />
        )}
      </Stack>
      {weapon && (
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
      )}
    </Box>
  );
}

function UnitWeapons({ unit }: { unit: Unit }) {
  const { t } = useTranslation();
  const assignments = unit.weapons ?? [];

  return (
    <Paper sx={{ p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
        {unit.name}
      </Typography>
      {assignments.length === 0 ? (
        <Typography color="text.secondary">{t('units.detail.unarmed')}</Typography>
      ) : (
        <Stack spacing={1.75}>
          {assignments.map((assignment) => (
            <WeaponAssignment key={`${assignment.type}-${assignment.id}`} assignment={assignment} />
          ))}
        </Stack>
      )}
    </Paper>
  );
}

function WeaponsComparison({ left, right }: { left: Unit; right: Unit }) {
  const { t } = useTranslation();
  return (
    <Section title={t('units.detail.weapons')} icon={GpsFixedIcon}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
        <UnitWeapons unit={left} />
        <UnitWeapons unit={right} />
      </Box>
    </Section>
  );
}

export default function UnitComparePage() {
  const { t } = useTranslation();
  const { unitId, compareUnitId } = useParams<{ unitId: string; compareUnitId: string }>();
  const left = units.find((candidate) => candidate.id === unitId);
  const right = units.find((candidate) => candidate.id === compareUnitId);
  const isValidComparison = Boolean(left && right && areComparableUnits(left, right));

  if (!left || !right || !isValidComparison) {
    return (
      <Container maxWidth="lg">
        <Button component={RouterLink} to={unitId ? `/units/${encodeURIComponent(unitId)}` : '/units'} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          {t('units.detail.backToCatalogue')}
        </Button>
        <Typography variant="h4">{t('units.compare.notFound')}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Button component={RouterLink} to={`/units/${encodeURIComponent(left.id)}`} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        {t('units.detail.backToCatalogue')}
      </Button>

      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="secondary.light" sx={{ fontWeight: 800 }}>
            {t(`units.compare.categories.${unitComparisonCategory(left)}`)}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 850 }}>
            {t('units.compare.title')}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr' }, gap: 2, alignItems: 'stretch' }}>
          <UnitHeader unit={left} />
          <Paper
            sx={{
              display: 'grid',
              placeItems: 'center',
              px: 2,
              minHeight: { xs: 56, md: 'auto' },
              color: 'secondary.light',
            }}
          >
            <CompareArrowsIcon />
          </Paper>
          <UnitHeader unit={right} />
        </Box>

        <SummaryTable left={left} right={right} />
        <MovementTable left={left} right={right} />
        <ArmourTable left={left} right={right} />
        <WeaponsComparison left={left} right={right} />
      </Stack>
    </Container>
  );
}
