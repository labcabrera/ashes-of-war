/**
 * ArmyFlowNode is the MUI-backed custom React Flow node for an army hierarchy element.
 */
import { memo, ReactNode } from 'react';
import { Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GroupsIcon from '@mui/icons-material/Groups';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import ShieldIcon from '@mui/icons-material/Shield';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import { ArmyNodeKind } from '../../../types/army';

export interface ArmyFlowNodeData extends Record<string, unknown> {
  label: string;
  kind: ArmyNodeKind;
  subtitle?: string;
  quantity?: number;
  onAdd: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export type OrganizationFlowNode = Node<ArmyFlowNodeData, 'organization'>;

const kindIcons: Record<ArmyNodeKind, ReactNode> = {
  army: <AccountTreeIcon fontSize="small" />,
  company: <GroupsIcon fontSize="small" />,
  platoon: <MilitaryTechIcon fontSize="small" />,
  section: <ShieldIcon fontSize="small" />,
  unit: <ShieldIcon fontSize="small" />,
};

function ArmyFlowNode({ id, data, selected }: NodeProps<OrganizationFlowNode>) {
  const { t } = useTranslation();
  const canHaveChildren = data.kind !== 'unit';
  const isRoot = data.kind === 'army';

  return (
    <>
      {!isRoot && <Handle type="target" position={Position.Top} />}
      <Paper
        elevation={selected ? 8 : 2}
        sx={{
          minWidth: 205,
          maxWidth: 245,
          p: 1,
          border: '1px solid',
          borderColor: selected ? 'secondary.main' : 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center' }}>
          <Box color={data.kind === 'unit' ? 'secondary.main' : 'primary.main'}>
            {kindIcons[data.kind]}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {t(`army.graph.kinds.${data.kind}`)}
            </Typography>
            <Typography variant="body2" noWrap title={data.label} sx={{ fontWeight: 600 }}>
              {data.label}
            </Typography>
          </Box>
          {data.quantity && data.quantity > 1 && (
            <Chip size="small" label={`x${data.quantity}`} />
          )}
        </Stack>
        {data.subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {data.subtitle}
          </Typography>
        )}
        <Stack className="nodrag" direction="row" sx={{ mt: 0.5, justifyContent: 'flex-end' }}>
          {canHaveChildren && (
            <Tooltip title={t('army.graph.addFormation')}>
              <IconButton size="small" onClick={() => data.onAdd(id)} aria-label={t('army.graph.addFormation')}>
                <AddIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t('army.graph.edit')}>
            <IconButton size="small" onClick={() => data.onEdit(id)} aria-label={t('army.graph.edit')}>
              <EditIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          {!isRoot && (
            <Tooltip title={t('common.delete')}>
              <IconButton size="small" onClick={() => data.onDelete(id)} aria-label={t('common.delete')}>
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Paper>
      {canHaveChildren && <Handle type="source" position={Position.Bottom} />}
    </>
  );
}

export default memo(ArmyFlowNode);
