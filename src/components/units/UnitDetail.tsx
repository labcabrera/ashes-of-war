/**
 * UnitDetail — slide-in Drawer with detailed stats for a selected unit.
 * Conditionally renders the TankProfile section for tank units.
 */
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { Unit } from '../../types/unit';

interface Props {
  unit: Unit | null;
  onClose: () => void;
}

export default function UnitDetail({ unit, onClose }: Props) {
  const { t } = useTranslation();
  return (
    <Drawer anchor="right" open={unit !== null} onClose={onClose}>
      <Box sx={{ width: 320, p: 2 }}>
        {unit && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{unit.name}</Typography>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

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
                    {key}: {val}
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
    </Drawer>
  );
}
