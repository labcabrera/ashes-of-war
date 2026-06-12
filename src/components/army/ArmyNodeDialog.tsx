/**
 * ArmyNodeDialog captures labels, formation kinds and quantities for hierarchy edits.
 */
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArmyNode, ArmyNodeKind } from '../../types/army';

type FormationKind = Exclude<ArmyNodeKind, 'army' | 'unit'>;

interface SaveValue {
  label: string;
  kind: FormationKind;
  quantity?: number;
}

interface Props {
  open: boolean;
  mode: 'add' | 'edit';
  node?: ArmyNode;
  onClose: () => void;
  onSave: (value: SaveValue) => void;
}

const formationKinds: FormationKind[] = ['company', 'platoon', 'section'];

export default function ArmyNodeDialog({ open, mode, node, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const [label, setLabel] = useState(mode === 'edit' ? node?.label ?? '' : '');
  const [kind, setKind] = useState<FormationKind>(
    mode === 'edit' && node && node.kind !== 'army' && node.kind !== 'unit' ? node.kind : 'company',
  );
  const [quantity, setQuantity] = useState(node?.quantity ?? 1);
  const isUnit = mode === 'edit' && node?.kind === 'unit';

  const submit = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    onSave({ label: trimmed, kind, quantity: isUnit ? Math.max(1, quantity) : undefined });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t(mode === 'add' ? 'army.graph.addFormation' : 'army.graph.edit')}</DialogTitle>
      <DialogContent>
        <Stack sx={{ mt: 1, gap: 2 }}>
          {mode === 'add' && (
            <FormControl fullWidth size="small">
              <InputLabel>{t('army.graph.formationType')}</InputLabel>
              <Select
                label={t('army.graph.formationType')}
                value={kind}
                onChange={(event) => setKind(event.target.value as FormationKind)}
              >
                {formationKinds.map((option) => (
                  <MenuItem key={option} value={option}>
                    {t(`army.graph.kinds.${option}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            autoFocus
            size="small"
            label={t('army.graph.label')}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
          {isUnit && (
            <TextField
              size="small"
              type="number"
              label={t('army.graph.quantity')}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              slotProps={{ htmlInput: { min: 1 } }}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="contained" onClick={submit} disabled={!label.trim()}>
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
