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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { Army } from '../../types/army';

interface Props {
  armies: Army[];
  selectedId: string | null;
  armyTypeId: string;
  onSelect: (army: Army) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
}

export default function ArmySaveManager({
  armies,
  selectedId,
  armyTypeId,
  onSelect,
  onCreate,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setNewName('');
  };

  const relevantArmies = armies.filter((a) => a.armyTypeId === armyTypeId);

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {t('army.save.title')}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <TextField
          size="small"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          label={t('army.save.name')}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
          sx={{ flex: 1 }}
        />
        <Button variant="contained" size="small" onClick={handleCreate} disabled={!newName.trim()}>
          {t('common.save')}
        </Button>
      </Box>
      {relevantArmies.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <List dense>
            {relevantArmies.map((army) => (
              <ListItemButton
                key={army.id}
                selected={army.id === selectedId}
                onClick={() => onSelect(army)}
                sx={{ pr: 5 }}
              >
                <ListItemText primary={army.name} />
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
    </Box>
  );
}
