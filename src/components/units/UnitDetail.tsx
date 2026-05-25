/**
 * UnitDetail - permanent information panel for a selected unit.
 * Conditionally renders the TankProfile section for tank units.
 */
import {
  Box,
  Avatar,
  Typography,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EngineeringIcon from '@mui/icons-material/Engineering';
import FlightIcon from '@mui/icons-material/Flight';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { useTranslation } from 'react-i18next';
import { Unit, UnitType, UnitWeapon } from '../../types/unit';
import { Weapon } from '../../types/weapon';

interface Props {
  unit: Unit | null;
  weapons: Weapon[];
}

const UNIT_ICONS = {
  infantry: MilitaryTechIcon,
  tank: DirectionsCarIcon,
  artillery: GpsFixedIcon,
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

interface WeaponAssignmentsProps {
  assignments: UnitWeapon[];
  weapons: Weapon[];
}

function WeaponAssignments({ assignments, weapons }: WeaponAssignmentsProps) {
  const { t } = useTranslation();

  return assignments.map((assignment) => {
    const weapon = weapons.find((entry) => entry.id === assignment.id);

    return (
      <Box
        key={`${assignment.type}-${assignment.id}`}
        sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2.25, mb: 2 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {assignment.count} x {weapon?.name ?? assignment.id}
          </Typography>
          <Chip label={t(`units.weaponMounts.${assignment.type}`)} variant="outlined" />
        </Box>
        {weapon ? (
          <Box sx={{ overflowX: 'auto' }}>
            <Table
              size="small"
              aria-label={`${weapon.name} ${t('weapons.profiles')}`}
              sx={{
                minWidth: 560,
                '& th': { fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' },
                '& td': { fontSize: '0.95rem' },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>{t('weapons.profile')}</TableCell>
                  <TableCell align="right">{t('weapons.shots')}</TableCell>
                  <TableCell align="right">{t('weapons.hitOn')}</TableCell>
                  <TableCell>{t('weapons.range')}</TableCell>
                  <TableCell align="right">{t('weapons.penetration')}</TableCell>
                  <TableCell align="right">{t('weapons.suppression')}</TableCell>
                  <TableCell>{t('weapons.characteristics')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weapon.profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{profile.name}</TableCell>
                    <TableCell align="right">{profile.shots}</TableCell>
                    <TableCell align="right">{profile.hitOn}</TableCell>
                    <TableCell>{profile.rangeModifier}</TableCell>
                    <TableCell align="right">{profile.armourPenetration ?? '-'}</TableCell>
                    <TableCell align="right">{profile.suppressionModifier ?? '-'}</TableCell>
                    <TableCell>{profile.characteristics?.join(', ') ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Typography variant="body1" color="warning.main" sx={{ fontSize: '1.05rem' }}>
            {t('units.detail.weaponUnavailable')}
          </Typography>
        )}
      </Box>
    );
  });
}

export default function UnitDetail({ unit, weapons }: Props) {
  const { t } = useTranslation();
  const UnitIcon = unit ? UNIT_ICONS[unit.type] : MilitaryTechIcon;
  const assignedWeapons = unit?.weapons ?? [];

  return (
    <Paper
      component="aside"
      aria-label={t('units.detail.title')}
      elevation={3}
      sx={{
        minHeight: { xs: 280, lg: 520 },
        position: { lg: 'sticky' },
        top: { lg: 16 },
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          height: { xs: 260, lg: 500 },
          bgcolor: 'primary.dark',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Avatar
          variant="rounded"
          src={unit?.imageUrl}
          alt={unit ? unit.name : ''}
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: 0,
            bgcolor: 'primary.dark',
            '& img': {
              objectFit: 'cover',
            },
          }}
        >
          <UnitIcon sx={{ fontSize: { xs: 120, lg: 144 }, color: 'secondary.main' }} />
        </Avatar>
      </Box>

      <Box sx={{ p: { xs: 3, lg: 3.5 } }}>
        {!unit ? (
          <>
            <Typography variant="h5" gutterBottom>
              {t('units.detail.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('units.detail.selectPrompt')}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2.5 }}>
              {unit.name}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', mb: 2.5 }}>
              <Chip label={t(`units.types.${unit.type}`)} />
              <Chip label={unit.faction} />
              <Chip label={`${unit.cost} pts`} color="secondary" />
            </Box>

            <Typography variant="body1" color="text.secondary" gutterBottom>
              {t('units.detail.availability')}: {unit.from}–{unit.to}
            </Typography>

            {unit.resourceCosts && Object.keys(unit.resourceCosts).length > 0 && (
              <>
                <Divider sx={{ my: 2.5 }} />
                <Typography variant="h6" gutterBottom>
                  {t('units.detail.resources')}
                </Typography>
                {Object.entries(unit.resourceCosts).map(([key, val]) => (
                  <Typography key={key} variant="body1">
                    {t(`army.resources.${key}`)}: {val}
                  </Typography>
                ))}
              </>
            )}

            {unit.type === 'tank' && unit.profile && (
              <>
                <Divider sx={{ my: 2.5 }} />
                <Typography variant="h6" gutterBottom>
                  {t('units.detail.armour')}
                </Typography>
                <Table
                  sx={{
                    '& th': { fontSize: '0.95rem', fontWeight: 600 },
                    '& td': { fontSize: '1.1rem', fontWeight: 600 },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('units.detail.front')}</TableCell>
                      <TableCell>{t('units.detail.side')}</TableCell>
                      <TableCell>{t('units.detail.rear')}</TableCell>
                      <TableCell>{t('units.detail.exposed')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{unit.profile.front}</TableCell>
                      <TableCell>{unit.profile.side}</TableCell>
                      <TableCell>{unit.profile.rear}</TableCell>
                      <TableCell>{unit.profile.exposed}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </>
            )}

            {unit.type === 'infantry' && (
              <>
                <Divider sx={{ my: 2.5 }} />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  {t('units.detail.bases')}
                </Typography>
                {unit.bases.map((base, index) => (
                  <Box
                    key={`${unit.id}-base-${index + 1}`}
                    sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2.25, mb: 2 }}
                  >
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: base.weapons.length ? 2 : 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
                        {t('units.detail.base', { number: index + 1 })}
                      </Typography>
                      <Chip label={`${base.members} ${t('units.detail.members')}`} color="secondary" />
                    </Box>
                    {base.weapons.length ? (
                      <WeaponAssignments assignments={base.weapons} weapons={weapons} />
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        {t('units.detail.unarmed')}
                      </Typography>
                    )}
                  </Box>
                ))}
              </>
            )}

            {assignedWeapons.length > 0 && (
              <>
                <Divider sx={{ my: 2.5 }} />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  {t('units.detail.weapons')}
                </Typography>
                <WeaponAssignments assignments={assignedWeapons} weapons={weapons} />
              </>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}
