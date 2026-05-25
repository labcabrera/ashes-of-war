/**
 * ArmyUnitList — shows the units currently in the active army with quantity controls.
 */
import { Box, List, ListItem, ListItemText, IconButton, Typography, Chip } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import { useTranslation } from 'react-i18next';
import { ArmyUnit } from '../../types/army';
import { Unit } from '../../types/unit';

interface Props {
  armyUnits: ArmyUnit[];
  unitMap: Map<string, Unit>;
  onRemove: (unitId: string) => void;
}

export default function ArmyUnitList({ armyUnits, unitMap, onRemove }: Props) {
  const { t } = useTranslation();

  if (armyUnits.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
        {t('army.units.empty')}
      </Typography>
    );
  }

  return (
    <List dense>
      {armyUnits.map(({ unitId, quantity }) => {
        const unit = unitMap.get(unitId);
        if (!unit) return null;
        return (
          <ListItem
            key={unitId}
            secondaryAction={
              <IconButton
                size="small"
                onClick={() => onRemove(unitId)}
                aria-label={t('army.units.remove')}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
            }
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Chip label={`×${quantity}`} size="small" />
              <ListItemText
                primary={unit.name}
                secondary={`${unit.cost * quantity} pts`}
              />
            </Box>
          </ListItem>
        );
      })}
    </List>
  );
}
