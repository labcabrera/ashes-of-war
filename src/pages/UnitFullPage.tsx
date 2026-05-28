/**
 * UnitFullPage - full-page extended view for one unit.
 */
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EngineeringIcon from '@mui/icons-material/Engineering';
import FlightIcon from '@mui/icons-material/Flight';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import unitsData from '../data/units/units.json';
import weaponsData from '../data/weapons/weapons.json';
import type { Armor, InfantryBase, Unit, UnitType, UnitWeapon } from '../types/unit';
import type { Weapon } from '../types/weapon';

const UNIT_ICONS = {
  infantry: MilitaryTechIcon,
  tank: DirectionsCarIcon,
  'tank-destroyer': DirectionsCarIcon,
  'assault-gun': DirectionsCarIcon,
  'self-propelled-artillery': GpsFixedIcon,
  motorised: DirectionsCarIcon,
  mechanised: DirectionsCarIcon,
  reconnaissance: GpsFixedIcon,
  engineer: EngineeringIcon,
  'artillery-towed': GpsFixedIcon,
  sniper: GpsFixedIcon,
  medic: LocalHospitalIcon,
  aircraft: FlightIcon,
  special: MilitaryTechIcon,
} satisfies Record<UnitType, typeof MilitaryTechIcon>;

const units = unitsData.units as unknown as Unit[];
const weapons = weaponsData.weapons as unknown as Weapon[];

function getWeapon(assignment: UnitWeapon) {
  return weapons.find((weapon) => weapon.id === assignment.id);
}

function weaponLabel(assignment: UnitWeapon) {
  return `${assignment.count} x ${getWeapon(assignment)?.name ?? assignment.id}`;
}

function weaponHref(weaponId: string) {
  return `/units?tab=weapons&weapon=${encodeURIComponent(weaponId)}`;
}

function armorRows(profile: NonNullable<Unit['profile']>): Array<[string, Armor]> {
  return [
    ['front', profile.front],
    ['side', profile.side],
    ['rear', profile.rear],
    ['exposed', profile.exposed],
  ];
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

function InfantryBases({ bases }: { bases: InfantryBase[] }) {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      {bases.map((base, index) => (
        <Box key={`base-${index + 1}`} sx={{ borderTop: 1, borderColor: 'divider', pt: 1.25 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t('units.detail.base', { number: index + 1 })}
            </Typography>
            <Chip label={`${base.members} ${t('units.detail.members')}`} size="small" color="secondary" />
          </Stack>
          <WeaponAssignments assignments={base.weapons} />
        </Box>
      ))}
    </Stack>
  );
}

export default function UnitFullPage() {
  const { t } = useTranslation();
  const { unitId } = useParams();
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

  return (
    <Container maxWidth="lg">
      <Button component={RouterLink} to="/units" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        {t('units.detail.backToCatalogue')}
      </Button>

      <Paper sx={{ overflow: 'hidden', mb: 3 }}>
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
            src={unit.imageUrl}
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
              <Chip label={unit.faction} />
              <Chip label={`${unit.cost} pts`} color="secondary" />
              <Chip label={`${unit.from}-${unit.to}`} variant="outlined" sx={{ color: 'inherit', borderColor: 'currentColor' }} />
            </Stack>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '0.85fr 1.15fr' }, gap: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
            {t('units.detail.movement.title')}
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableBody>
                {(['tactical', 'cruise', 'maximum', 'offRoad'] as const).map((field) => (
                  <TableRow key={field}>
                    <TableCell>{t(`units.detail.movement.${field}`)}</TableCell>
                    <TableCell align="right">{unit.movement[field]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {unit.resourceCosts && (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                {t('units.detail.resources')}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 3, flexWrap: 'wrap' }}>
                {Object.entries(unit.resourceCosts).map(([resource, cost]) => (
                  <Chip key={resource} label={`${t(`army.resources.${resource}`)}: ${cost}`} />
                ))}
              </Stack>
            </>
          )}

          {unit.profile && (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                {t('units.detail.armour')}
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('units.detail.armourFacing')}</TableCell>
                      <TableCell align="right">{t('units.detail.armourValue')}</TableCell>
                      <TableCell align="right">{t('units.detail.armourMM')}</TableCell>
                      <TableCell align="right">{t('units.detail.armourInclination')}</TableCell>
                      <TableCell>{t('units.detail.armourNotes')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {armorRows(unit.profile).map(([facing, armor]) => (
                      <TableRow key={facing}>
                        <TableCell>{t(`units.detail.${facing}`)}</TableCell>
                        <TableCell align="right">{armor.value}</TableCell>
                        <TableCell align="right">{armor.armorMM}</TableCell>
                        <TableCell align="right">{armor.armorInclination} deg</TableCell>
                        <TableCell>{armor.notes ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
            {unit.type === 'infantry' ? t('units.detail.bases') : t('units.detail.weapons')}
          </Typography>
          <Paper sx={{ p: 2.25 }}>
            {unit.type === 'infantry' ? (
              <InfantryBases bases={unit.bases} />
            ) : (
              <WeaponAssignments assignments={assignedWeapons} />
            )}
          </Paper>

          {unit.keywords && unit.keywords.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                {t('units.detail.keywords')}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {unit.keywords.map((keyword) => (
                  <Chip key={keyword} label={t(`units.keywords.${keyword}`, keyword)} color="warning" />
                ))}
              </Stack>
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
}
