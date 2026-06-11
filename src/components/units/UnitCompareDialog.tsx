/**
 * Dialog for selecting a comparable unit from the same gameplay category.
 */
import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useTranslation } from 'react-i18next';
import type { Unit } from '../../types/unit';
import { comparableUnits, unitComparisonCategory } from '../../utils/unitComparison';

interface Props {
  open: boolean;
  unit: Unit;
  units: Unit[];
  onClose: () => void;
  onView: (unit: Unit) => void;
}

export default function UnitCompareDialog({ open, unit, units, onClose, onView }: Props) {
  const { t } = useTranslation();
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const options = useMemo(() => comparableUnits(unit, units), [unit, units]);

  function handleClose() {
    setSelectedUnit(null);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CompareArrowsIcon color="secondary" />
        {t('units.compare.dialogTitle')}
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t(`units.compare.categories.${unitComparisonCategory(unit)}`)}
        </Typography>
        <Autocomplete
          options={options}
          value={selectedUnit}
          onChange={(_event, value) => setSelectedUnit(value)}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText={t('units.compare.noOptions')}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('units.compare.searchLabel')}
              placeholder={t('units.compare.searchPlaceholder')}
              autoFocus
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          color="secondary"
          disabled={!selectedUnit}
          onClick={() => {
            if (selectedUnit) {
              onView(selectedUnit);
              setSelectedUnit(null);
            }
          }}
        >
          {t('common.view')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
