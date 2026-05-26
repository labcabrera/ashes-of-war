/**
 * ArmyFlowEditor renders and edits an army organizational hierarchy with React Flow.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  Connection,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  NodeMouseHandler,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ArmyFlowNode, { OrganizationFlowNode } from './flow/ArmyFlowNode';
import ArmyNodeDialog from './flow/ArmyNodeDialog';
import { Army, ArmyNode, ArmyNodeKind, ArmyNodePosition } from '../../types/army';
import { Unit } from '../../types/unit';

type FormationKind = Exclude<ArmyNodeKind, 'army' | 'unit'>;

interface Props {
  army: Army;
  unitMap: Map<string, Unit>;
  selectedNodeId: string | null;
  onSelectedNodeChange: (nodeId: string | null) => void;
  onAddFormation: (parentId: string, kind: FormationKind, label: string) => void;
  onUpdateNode: (nodeId: string, label: string, quantity?: number) => void;
  onDeleteNode: (nodeId: string) => void;
  onPositionNode: (nodeId: string, position: ArmyNodePosition) => void;
  onReparentNode: (nodeId: string, parentId: string) => boolean;
}

const nodeTypes = { organization: ArmyFlowNode };

export default function ArmyFlowEditor({
  army,
  unitMap,
  selectedNodeId,
  onSelectedNodeChange,
  onAddFormation,
  onUpdateNode,
  onDeleteNode,
  onPositionNode,
  onReparentNode,
}: Props) {
  const { t } = useTranslation();
  const [dialog, setDialog] = useState<{ mode: 'add' | 'edit'; nodeId: string } | null>(null);
  const [nodeToDelete, setNodeToDelete] = useState<ArmyNode | null>(null);
  const [invalidConnection, setInvalidConnection] = useState(false);

  useEffect(() => {
    if (selectedNodeId && !army.nodes.some((node) => node.id === selectedNodeId)) {
      onSelectedNodeChange(null);
    }
  }, [army.nodes, onSelectedNodeChange, selectedNodeId]);

  const handleAdd = useCallback((nodeId: string) => setDialog({ mode: 'add', nodeId }), []);
  const handleEdit = useCallback((nodeId: string) => setDialog({ mode: 'edit', nodeId }), []);
  const handleDelete = useCallback(
    (nodeId: string) => setNodeToDelete(army.nodes.find((node) => node.id === nodeId) ?? null),
    [army.nodes],
  );

  const nodes = useMemo<OrganizationFlowNode[]>(
    () => army.nodes.map((node) => {
      const unit = node.unitId ? unitMap.get(node.unitId) : undefined;
      return {
        id: node.id,
        type: 'organization',
        position: node.position,
        selected: node.id === selectedNodeId,
        data: {
          kind: node.kind,
          label: node.label || unit?.name || t('army.graph.unknownUnit'),
          subtitle: unit ? `${unit.cost} ${t('army.budget.points')}` : undefined,
          quantity: node.quantity,
          onAdd: handleAdd,
          onEdit: handleEdit,
          onDelete: handleDelete,
        },
      };
    }),
    [army.nodes, handleAdd, handleDelete, handleEdit, selectedNodeId, t, unitMap],
  );

  const edges = useMemo<Edge[]>(
    () => army.nodes
      .filter((node) => node.parentId)
      .map((node) => ({
        id: `${node.parentId}-${node.id}`,
        source: node.parentId as string,
        target: node.id,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
      })),
    [army.nodes],
  );

  const onNodeClick: NodeMouseHandler<OrganizationFlowNode> = useCallback(
    (_event, node) => onSelectedNodeChange(node.id),
    [onSelectedNodeChange],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (!onReparentNode(connection.target, connection.source)) {
        setInvalidConnection(true);
      }
    },
    [onReparentNode],
  );

  const selectedDialogNode = dialog
    ? army.nodes.find((node) => node.id === dialog.nodeId)
    : undefined;

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {t('army.graph.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {t('army.graph.instructions')}
      </Typography>
      <Box sx={{ height: { xs: 560, md: 680 }, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <ReactFlow<OrganizationFlowNode, Edge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={() => onSelectedNodeChange(null)}
          onNodeDragStop={(_event, node) => onPositionNode(node.id, node.position)}
          onConnect={handleConnect}
          fitView
          minZoom={0.35}
          maxZoom={1.75}
        >
          <Background />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>
      </Box>

      {dialog && (
        <ArmyNodeDialog
          key={`${dialog.mode}-${dialog.nodeId}`}
          open
          mode={dialog.mode}
          node={selectedDialogNode}
          onClose={() => setDialog(null)}
          onSave={({ label, kind, quantity }) => {
            if (dialog.mode === 'add') {
              onAddFormation(dialog.nodeId, kind, label);
            } else {
              onUpdateNode(dialog.nodeId, label, quantity);
            }
            setDialog(null);
          }}
        />
      )}

      <Dialog open={!!nodeToDelete} onClose={() => setNodeToDelete(null)}>
        <DialogTitle>{t('army.graph.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('army.graph.deletePrompt')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNodeToDelete(null)}>{t('common.cancel')}</Button>
          <Button
            color="error"
            onClick={() => {
              if (nodeToDelete) onDeleteNode(nodeToDelete.id);
              setNodeToDelete(null);
            }}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={invalidConnection} onClose={() => setInvalidConnection(false)}>
        <DialogTitle>{t('army.graph.invalidConnectionTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('army.graph.invalidConnection')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvalidConnection(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
