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
import { getDescription } from '../i18n/descriptions';
import type { Armor, Unit, UnitType, UnitWeapon } from '../types/unit';
import type { Weapon } from '../types/weapon';
import { unitImageUrl } from '../utils/images';

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

function movementValue(value: number) {
  return `${value}'`;
}

function isNonVehicleUnit(unit: Unit) {
  return !unit.profile;
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

export default function UnitFullPage() {
  const { t, i18n } = useTranslation();
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
  const description =
    getDescription('units', unit.id, i18n.resolvedLanguage) ??
    getDescription('types', unit.type, i18n.resolvedLanguage);

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

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '0.85fr 1.15fr' }, gap: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
            {t('units.detail.movement.title')}
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
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

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
            {t('units.detail.thresholds')}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 3, flexWrap: 'wrap' }}>
            <Chip
              label={`${t('units.detail.organizationThreshold')}: ${unit.organizationThreshold}`}
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
                label={`${t('units.detail.combatants')}: ${unit.combatants}`}
                color="secondary"
                variant="outlined"
              />
            )}
          </Stack>

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
            {t('units.detail.weapons')}
          </Typography>
          <Paper sx={{ p: 2.25 }}>
            <WeaponAssignments assignments={assignedWeapons} />
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

      {description && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
            {t('units.detail.description')}
          </Typography>
          <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
            {description}
          </Typography>
        </>
      )}
    </Container>
  );
}
