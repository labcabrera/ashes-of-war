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
  Tooltip,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EngineeringIcon from '@mui/icons-material/Engineering';
import FlightIcon from '@mui/icons-material/Flight';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Unit, UnitType, UnitWeapon } from '../../types/unit';
import type { Weapon } from '../../types/weapon';

interface Props {
  unit: Unit | null;
  weapons: Weapon[];
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

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

function weaponLabel(assignment: UnitWeapon, weapons: Weapon[]) {
  const weapon = weapons.find((entry) => entry.id === assignment.id);
  return `${assignment.count} x ${weapon?.name ?? assignment.id}`;
}

export default function UnitDetail({ unit, weapons, collapsed, onCollapsedChange }: Props) {
  const { t } = useTranslation();
  const UnitIcon = unit ? UNIT_ICONS[unit.type] : MilitaryTechIcon;
  const assignedWeapons = unit?.weapons ?? [];

  if (collapsed) {
    return (
      <Paper
        component="aside"
        aria-label={t('units.detail.compactTitle')}
        elevation={3}
        sx={{
          width: { xs: '100%', lg: 72 },
          minHeight: { xs: 'auto', lg: 520 },
          position: { lg: 'sticky' },
          top: { lg: 16 },
          p: 1,
        }}
      >
        <Stack direction={{ xs: 'row', lg: 'column' }} spacing={1} sx={{ alignItems: 'center' }}>
          <Tooltip title={t('units.detail.expandPanel')}>
            <IconButton
              onClick={() => onCollapsedChange(false)}
              aria-label={t('units.detail.expandPanel')}
              size="small"
            >
              <ChevronLeftIcon sx={{ display: { xs: 'none', lg: 'block' } }} />
              <ChevronRightIcon sx={{ display: { xs: 'block', lg: 'none' } }} />
            </IconButton>
          </Tooltip>
          <Avatar src={unit?.imageUrl} alt={unit?.name ?? ''} variant="rounded" sx={{ width: 48, height: 48 }}>
            <UnitIcon />
          </Avatar>
          {unit && (
            <Chip
              label={unit.cost}
              size="small"
              color="secondary"
              sx={{ width: { lg: 48 }, '& .MuiChip-label': { px: 0.5 } }}
            />
          )}
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      component="aside"
      aria-label={t('units.detail.compactTitle')}
      elevation={3}
      sx={{
        minHeight: { xs: 240, lg: 520 },
        position: { lg: 'sticky' },
        top: { lg: 16 },
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
        <Typography variant="subtitle2" sx={{ px: 1, fontWeight: 700 }}>
          {t('units.detail.compactTitle')}
        </Typography>
        <Tooltip title={t('units.detail.collapsePanel')}>
          <IconButton
            onClick={() => onCollapsedChange(true)}
            aria-label={t('units.detail.collapsePanel')}
            size="small"
          >
            <ChevronRightIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {!unit ? (
        <Box sx={{ p: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            {t('units.detail.selectPrompt')}
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              height: 112,
              bgcolor: 'primary.dark',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Avatar
              variant="rounded"
              src={unit.imageUrl}
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
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('units.detail.movement.maximum')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {unit.movement.maximum}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('units.detail.movement.offRoad')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {unit.movement.offRoad}
                </Typography>
              </Box>
            </Stack>

            {unit.profile && (
              <Stack direction="row" spacing={0.75} useFlexGap sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                {(['front', 'side', 'rear', 'exposed'] as const).map((facing) => (
                  <Chip
                    key={facing}
                    label={`${t(`units.detail.${facing}`)} ${unit.profile?.[facing].value}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
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
      )}
    </Paper>
  );
}
