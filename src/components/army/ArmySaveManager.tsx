/**
 * ArmySaveManager — create, select, and delete saved armies.
 */
import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { Army } from '../../types/army';
import type { FactionId } from '../../types/faction';
import FactionSelect from '../factions/FactionSelect';

interface Props {
  armies: Army[];
  selectedId: string | null;
  onSelect: (army: Army) => void;
  onCreate: (name: string, faction: FactionId, pointBudget: number) => void;
  onDelete: (id: string) => void;
  allowedFactionIds: FactionId[];
}

export default function ArmySaveManager({
  armies,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  allowedFactionIds,
}: Props) {
  const { t } = useTranslation();
  const defaultFaction = allowedFactionIds[0] ?? 'german';
  const [newName, setNewName] = useState('');
  const [faction, setFaction] = useState<FactionId>(defaultFaction);
  const [pointBudget, setPointBudget] = useState(1000);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreate(trimmed, faction, Math.max(1, Math.floor(pointBudget || 1000)));
    setNewName('');
    setPointBudget(1000);
    setDialogOpen(false);
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {t('army.save.title')}
      </Typography>
      <Button variant="contained" fullWidth onClick={() => setDialogOpen(true)} sx={{ mb: 1 }}>
        {t('army.save.new')}
      </Button>
      {armies.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <List dense>
            {armies.map((army) => (
              <ListItemButton
                key={army.id}
                selected={army.id === selectedId}
                onClick={() => onSelect(army)}
                sx={{ pr: 5 }}
              >
                <ListItemText
                  primary={army.name}
                  secondary={`${army.pointBudget ?? 1000} ${t('army.budget.points')}`}
                />
                <IconButton
                  size="small"
                  edge="end"
                  onClick={(e) => { e.stopPropagation(); onDelete(army.id); }}
                  aria-label={t('common.delete')}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('army.save.new')}</DialogTitle>
        <DialogContent>
          <Stack sx={{ mt: 1, gap: 2 }}>
            <TextField
              autoFocus
              size="small"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              label={t('army.save.name')}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
            <FactionSelect
              value={faction}
              onChange={(value) => {
                if (value) setFaction(value);
              }}
              label={t('army.faction.label')}
              allowedFactionIds={allowedFactionIds}
              minWidth={0}
            />
            <TextField
              size="small"
              type="number"
              value={pointBudget}
              onChange={(e) => setPointBudget(Number(e.target.value))}
              label={t('army.budget.points')}
              slotProps={{ htmlInput: { min: 1 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newName.trim()}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
