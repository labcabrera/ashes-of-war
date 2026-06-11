/**
 * UnitList - renders unit cards or a compact selectable table.
 * Out-of-year units remain visible at reduced opacity (FR-019).
 */
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Unit } from '../../types/unit';
import UnitCard from './UnitCard';

interface Props {
  units: Unit[];
  isOutOfYear: (unit: Unit) => boolean;
  viewMode: 'cards' | 'table';
  onSelect: (unit: Unit) => void;
}

export default function UnitList({ units, isOutOfYear, viewMode, onSelect }: Props) {
  const { t } = useTranslation();

  if (units.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
        {t('units.noResults')}
      </Typography>
    );
  }

  if (viewMode === 'table') {
    return (
      <TableContainer component={Paper}>
        <Table size="small" aria-label={t('catalogue.tabs.units')}>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.name')}</TableCell>
              <TableCell>{t('common.type')}</TableCell>
              <TableCell>{t('common.faction')}</TableCell>
              <TableCell align="right">{t('common.cost')}</TableCell>
              <TableCell>{t('units.detail.availability')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {units.map((unit) => {
              const outOfYear = isOutOfYear(unit);
              return (
                <TableRow key={unit.id} sx={{ opacity: outOfYear ? 0.38 : 1 }}>
                  <TableCell>
                    <Button
                      onClick={() => onSelect(unit)}
                      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      {unit.name}
                    </Button>
                  </TableCell>
                  <TableCell>{t(`units.types.${unit.type}`)}</TableCell>
                  <TableCell>{t(`factions.${unit.faction}`, unit.faction)}</TableCell>
                  <TableCell align="right">{unit.cost}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${unit.from}-${unit.to}`}
                      size="small"
                      variant="outlined"
                      color={outOfYear ? 'warning' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
        gap: 2.5,
      }}
    >
      {units.map((unit) => (
        <UnitCard
          key={unit.id}
          unit={unit}
          isOutOfYear={isOutOfYear(unit)}
          onClick={() => onSelect(unit)}
        />
      ))}
    </Box>
  );
}
