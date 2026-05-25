/**
 * ArmyUnitPicker — scrollable list of available units to add to the army.
 * Filters by the army type's faction when a faction is specified (otherwise shows all).
 */
import { Box, List, ListItemButton, ListItemText, Typography, ListItemSecondaryAction, IconButton, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { Unit } from '../../types/unit';
import { ArmyType } from '../../types/army';

interface Props {
  allUnits: Unit[];
  armyType: ArmyType;
  onAdd: (unitId: string) => void;
}

export default function ArmyUnitPicker({ allUnits, armyType, onAdd }: Props) {
  const { t } = useTranslation();

  const available = armyType.faction
    ? allUnits.filter((u) => u.faction === armyType.faction)
    : allUnits;

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {t('army.units.title')}
      </Typography>
      <List dense sx={{ maxHeight: 320, overflowY: 'auto' }}>
        {available.map((unit) => (
          <ListItemButton key={unit.id} sx={{ pr: 6 }}>
            <ListItemText
              primary={unit.name}
              secondary={`${t(`units.types.${unit.type}`)} · ${unit.cost} pts`}
            />
            <ListItemSecondaryAction>
              <Chip label={`${unit.cost}`} size="small" sx={{ mr: 1 }} />
              <IconButton size="small" onClick={() => onAdd(unit.id)} aria-label={t('army.units.add')}>
                <AddIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
