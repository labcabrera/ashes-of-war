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

interface Props {
  unit: Unit | null;
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

export default function UnitDetail({ unit }: Props) {
  const { t } = useTranslation();
  const UnitIcon = unit ? UNIT_ICONS[unit.type] : MilitaryTechIcon;

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
          </>
        )}
      </Box>
    </Paper>
  );
}
