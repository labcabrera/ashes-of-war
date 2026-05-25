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
import { Unit, UnitType } from '../../types/unit';
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

export default function UnitDetail({ unit, weapons }: Props) {
  const { t } = useTranslation();
  const UnitIcon = unit ? UNIT_ICONS[unit.type] : MilitaryTechIcon;
  const assignedWeapons = (unit?.weapons ?? []).map((assignment) => ({
    assignment,
    weapon: weapons.find((weapon) => weapon.id === assignment.id),
  }));

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

      <Box sx={{ p: 3 }}>
        {!unit ? (
          <>
            <Typography variant="h6" gutterBottom>
              {t('units.detail.title')}
            </Typography>
            <Typography color="text.secondary">{t('units.detail.selectPrompt')}</Typography>
          </>
        ) : (
          <>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              {unit.name}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip label={t(`units.types.${unit.type}`)} size="small" />
              <Chip label={unit.faction} size="small" />
              <Chip label={`${unit.cost} pts`} size="small" color="secondary" />
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('units.detail.availability')}: {unit.from}–{unit.to}
            </Typography>

            {unit.resourceCosts && Object.keys(unit.resourceCosts).length > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" gutterBottom>
                  {t('units.detail.resources')}
                </Typography>
                {Object.entries(unit.resourceCosts).map(([key, val]) => (
                  <Typography key={key} variant="body2">
                    {t(`army.resources.${key}`)}: {val}
                  </Typography>
                ))}
              </>
            )}

            {unit.type === 'tank' && unit.profile && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" gutterBottom>
                  {t('units.detail.armour')}
                </Typography>
                <Table size="small">
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

            {assignedWeapons.length > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" gutterBottom>
                  {t('units.detail.weapons')}
                </Typography>
                {assignedWeapons.map(({ assignment, weapon }) => (
                  <Box
                    key={`${assignment.type}-${assignment.id}`}
                    sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, mb: 1.5 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {assignment.count} x {weapon?.name ?? assignment.id}
                      </Typography>
                      <Chip
                        size="small"
                        label={t(`units.weaponMounts.${assignment.type}`)}
                        variant="outlined"
                      />
                    </Box>
                    {weapon ? (
                      weapon.profiles.map((profile) => (
                        <Typography
                          key={profile.id}
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {profile.name}: {t('weapons.hitOn')} {profile.hitOn}, {t('weapons.range')}{' '}
                          {profile.rangeModifier}
                          {profile.armourPenetration !== undefined
                            ? `, ${t('weapons.penetration')} ${profile.armourPenetration}`
                            : ''}
                          {profile.suppressionModifier !== undefined
                            ? `, ${t('weapons.suppression')} ${profile.suppressionModifier}`
                            : ''}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="caption" color="warning.main">
                        {t('units.detail.weaponUnavailable')}
                      </Typography>
                    )}
                  </Box>
                ))}
              </>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}
