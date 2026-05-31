/**
 * UnitDetail - compact collapsible side menu for the selected unit.
 */
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EngineeringIcon from '@mui/icons-material/Engineering';
import FlightIcon from '@mui/icons-material/Flight';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Unit, UnitType, UnitKeyword, UnitWeapon } from '../../types/unit';
import type { Weapon } from '../../types/weapon';
import { unitImageUrl } from '../../utils/images';

interface Props {
  unit: Unit | null;
  weapons: Weapon[];
  onClose: () => void;
}

const UNIT_ICONS = {
  infantry: MilitaryTechIcon,
  tank: DirectionsCarIcon,
  'tank-destroyer': DirectionsCarIcon,
  'assault-gun': DirectionsCarIcon,
  'self-propelled-artillery': GpsFixedIcon,
  mechanised: DirectionsCarIcon,
  engineer: EngineeringIcon,
  'artillery-towed': GpsFixedIcon,
  'anti-tank-towed': GpsFixedIcon,
  aircraft: FlightIcon,
} satisfies Record<UnitType, typeof MilitaryTechIcon>;

function weaponLabel(assignment: UnitWeapon, weapons: Weapon[]) {
  const weapon = weapons.find((entry) => entry.id === assignment.id);
  return `${assignment.count} x ${weapon?.name ?? assignment.id}`;
}

function movementValue(value: number) {
  return `${value}'`;
}

function isNonVehicleUnit(unit: Unit) {
  return !unit.profile;
}

function armorLabel(unit: Unit) {
  if (!unit.profile) {
    return '';
  }

  const { front, side, rear, exposed } = unit.profile;
  return `Armor: ${front.value}/${side.value}/${rear.value}/${exposed.value}`;
}

export default function UnitDetail({ unit, weapons, onClose }: Props) {
  const { t } = useTranslation();
  const UnitIcon = unit ? UNIT_ICONS[unit.type] : MilitaryTechIcon;
  const assignedWeapons = unit?.weapons ?? [];

  if (!unit) return (
    <Paper
      component="aside"
      elevation={0}
      sx={{
        minHeight: { xs: 0, lg: 600 },
        position: { lg: 'sticky' },
        top: { lg: 16 },
        bgcolor: 'transparent',
      }}
    />
  );

  return (
    <Paper
      component="aside"
      aria-label={t('units.detail.compactTitle')}
      elevation={3}
      sx={{
        minHeight: { xs: 240, lg: 600 },
        position: { lg: 'sticky' },
        top: { lg: 16 },
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
        <Typography variant="subtitle2" sx={{ px: 1, fontWeight: 700 }}>
          {t('units.detail.compactTitle')}
        </Typography>
        <Tooltip title={t('common.close')}>
          <IconButton
            onClick={onClose}
            aria-label={t('common.close')}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <>
          <Box
            sx={{
              height: 132,
              bgcolor: 'primary.dark',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Avatar
              variant="rounded"
              src={unitImageUrl(unit.faction, unit.id)}
              alt={unit.name}
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: 0,
                bgcolor: 'primary.dark',
                '& img': { objectFit: 'cover' },
              }}
            >
              <UnitIcon sx={{ fontSize: 72, color: 'secondary.main' }} />
            </Avatar>
          </Box>

          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 1 }}>
              {unit.name}
            </Typography>
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ mb: 1.5, flexWrap: 'wrap' }}>
              <Chip label={t(`units.types.${unit.type}`)} size="small" />
              <Chip label={`${unit.cost} pts`} color="secondary" size="small" />
              <Chip label={`${unit.from}-${unit.to}`} variant="outlined" size="small" />
              {unit.type === 'infantry' && (
                <Chip
                  label={`${unit.combatants} ${t('units.detail.combatants')}`}
                  variant="outlined"
                  size="small"
                />
              )}
              <Chip
                label={`${t('units.detail.organizationThresholdShort')} ${unit.organizationThreshold}`}
                variant="outlined"
                size="small"
              />
              {isNonVehicleUnit(unit) && (
                <Chip
                  label={`${t('units.detail.casualtiesThresholdShort')} ${unit.casualtiesThreshold}`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>

            {unit.keywords && unit.keywords.length > 0 && (
              <Stack direction="row" spacing={0.75} useFlexGap sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                {(unit.keywords as UnitKeyword[]).map((kw) => (
                  <Chip key={kw} label={t(`units.keywords.${kw}`, { defaultValue: kw })} size="small" variant="outlined" color="info" />
                ))}
              </Stack>
            )}

            <Table size="small" sx={{ mb: 1.5 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ px: 0.75, py: 0.5 }}>{t('units.detail.movement.speed')}</TableCell>
                  <TableCell align="right" sx={{ px: 0.75, py: 0.5 }}>
                    {t('units.detail.movement.road')}
                  </TableCell>
                  <TableCell align="right" sx={{ px: 0.75, py: 0.5 }}>
                    {t('units.detail.movement.crossCountry')}
                  </TableCell>
                  <TableCell align="right" sx={{ px: 0.75, py: 0.5 }}>
                    {t('units.detail.movement.rough')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(['tactical', 'cruise', 'dash'] as const).map((speed) => (
                  <TableRow key={speed}>
                    <TableCell sx={{ px: 0.75, py: 0.5 }}>{t(`units.detail.movement.${speed}`)}</TableCell>
                    <TableCell align="right" sx={{ px: 0.75, py: 0.5 }}>
                      {movementValue(unit.movement[speed].road)}
                    </TableCell>
                    <TableCell align="right" sx={{ px: 0.75, py: 0.5 }}>
                      {movementValue(unit.movement[speed].crossCountry)}
                    </TableCell>
                    <TableCell align="right" sx={{ px: 0.75, py: 0.5 }}>
                      {movementValue(unit.movement[speed].rough)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {unit.profile && (
              <Stack direction="row" spacing={0.75} useFlexGap sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                <Chip label={armorLabel(unit)} size="small" variant="outlined" />
              </Stack>
            )}

            {assignedWeapons.length > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t('units.detail.weapons')}
                </Typography>
                <Stack spacing={0.75}>
                  {assignedWeapons.map((assignment) => (
                    <Button
                      key={`${assignment.type}-${assignment.id}`}
                      component={RouterLink}
                      to={`/units?tab=weapons&weapon=${encodeURIComponent(assignment.id)}`}
                      variant="text"
                      size="small"
                      endIcon={<OpenInNewIcon fontSize="small" />}
                      sx={{ justifyContent: 'space-between', textTransform: 'none', px: 0 }}
                    >
                      {weaponLabel(assignment, weapons)}
                    </Button>
                  ))}
                </Stack>
              </>
            )}

            <Divider sx={{ my: 1.5 }} />
            <Button
              component={RouterLink}
              to={`/units/${encodeURIComponent(unit.id)}`}
              variant="contained"
              fullWidth
              endIcon={<OpenInNewIcon />}
            >
              {t('units.detail.openFull')}
            </Button>
          </Box>
        </>
    </Paper>
  );
}
