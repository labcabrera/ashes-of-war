/**
 * ArmyHierarchyEditor renders and edits an army organizational hierarchy as a single tree.
 */
import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GroupsIcon from '@mui/icons-material/Groups';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import ShieldIcon from '@mui/icons-material/Shield';
import { useTranslation } from 'react-i18next';
import ArmyNodeDialog from './ArmyNodeDialog';
import type { Army, ArmyNode, ArmyNodeKind } from '../../types/army';
import type { FactionId } from '../../types/faction';
import type { Unit, UnitType } from '../../types/unit';
import { factionFlagUrl, unitImageUrl } from '../../utils/images';

type FormationKind = Exclude<ArmyNodeKind, 'army' | 'unit'>;

interface Props {
  army: Army;
  unitMap: Map<string, Unit>;
  allUnits: Unit[];
  armyFaction?: FactionId;
  selectedNodeId: string | null;
  onSelectedNodeChange: (nodeId: string | null) => void;
  onAddFormation: (parentId: string, kind: FormationKind, label: string) => void;
  onAddUnit: (parentId: string, unitId: string) => void;
  onUpdateNode: (nodeId: string, label: string, quantity?: number) => void;
  onDeleteNode: (nodeId: string) => void;
}

const kindIcons: Record<ArmyNodeKind, ReactNode> = {
  army: <AccountTreeIcon fontSize="small" />,
  company: <GroupsIcon fontSize="small" />,
  platoon: <MilitaryTechIcon fontSize="small" />,
  section: <ShieldIcon fontSize="small" />,
  unit: <ShieldIcon fontSize="small" />,
};

function rootNode(nodes: ArmyNode[]) {
  return nodes.find((node) => node.kind === 'army' && node.parentId === null) ?? nodes[0];
}

function buildChildrenByParent(nodes: ArmyNode[]) {
  const children = new Map<string | null, ArmyNode[]>();
  nodes.forEach((node) => {
    const siblings = children.get(node.parentId) ?? [];
    siblings.push(node);
    children.set(node.parentId, siblings);
  });
  return children;
}

function nodeTitle(node: ArmyNode, unitMap: Map<string, Unit>, fallback: string) {
  if (node.kind !== 'unit') return node.label;
  return node.label || (node.unitId ? unitMap.get(node.unitId)?.name : undefined) || fallback;
}

function nodePointCost(node: ArmyNode, unitMap: Map<string, Unit>) {
  if (node.kind !== 'unit' || !node.unitId) return null;
  const unit = unitMap.get(node.unitId);
  if (!unit) return null;
  return unit.cost * (node.quantity ?? 1);
}

function UnitImage({ unit, height = 128 }: { unit: Unit; height?: number }) {
  const flagUrl = factionFlagUrl(unit.faction);
  const [image, setImage] = useState(unit.imageUrl ?? unitImageUrl(unit.faction, unit.id));
  const isFlagFallback = image === flagUrl;

  return (
    <CardMedia
      component="img"
      height={height}
      image={image}
      alt=""
      aria-hidden="true"
      onError={() => setImage(flagUrl)}
      sx={{
        objectFit: isFlagFallback ? 'contain' : 'cover',
        p: isFlagFallback ? 2 : 0,
        bgcolor: 'background.default',
        filter: isFlagFallback ? undefined : 'sepia(0.35) saturate(0.9) contrast(1.04) brightness(0.92)',
      }}
    />
  );
}

function UnitTreeImage({ unit }: { unit: Unit }) {
  const flagUrl = factionFlagUrl(unit.faction);
  const [image, setImage] = useState(unit.imageUrl ?? unitImageUrl(unit.faction, unit.id));

  return (
    <Box
      component="img"
      src={image}
      alt=""
      aria-hidden="true"
      onError={() => setImage(flagUrl)}
      sx={{
        width: 56,
        height: 40,
        objectFit: image === flagUrl ? 'contain' : 'cover',
        borderRadius: 0.75,
        bgcolor: 'background.default',
        border: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
      }}
    />
  );
}

export default function ArmyHierarchyEditor({
  army,
  unitMap,
  allUnits,
  armyFaction,
  selectedNodeId,
  onSelectedNodeChange,
  onAddFormation,
  onAddUnit,
  onUpdateNode,
  onDeleteNode,
}: Props) {
  const { t } = useTranslation();
  const [dialog, setDialog] = useState<{ mode: 'add' | 'edit'; nodeId: string } | null>(null);
  const [nodeToDelete, setNodeToDelete] = useState<ArmyNode | null>(null);
  const [unitDialogParentId, setUnitDialogParentId] = useState<string | null>(null);
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType | 'all'>('all');

  const childrenByParent = useMemo(() => buildChildrenByParent(army.nodes), [army.nodes]);
  const root = useMemo(() => rootNode(army.nodes), [army.nodes]);
  const selectedNode = army.nodes.find((node) => node.id === selectedNodeId) ?? root;
  const selectedDialogNode = dialog ? army.nodes.find((node) => node.id === dialog.nodeId) : undefined;
  const availableUnits = useMemo(
    () => (armyFaction ? allUnits.filter((unit) => unit.faction === armyFaction) : allUnits),
    [allUnits, armyFaction],
  );
  const availableUnitTypes = useMemo(
    () => Array.from(new Set(availableUnits.map((unit) => unit.type))),
    [availableUnits],
  );
  const unitDialogUnits = selectedUnitType === 'all'
    ? availableUnits
    : availableUnits.filter((unit) => unit.type === selectedUnitType);

  useEffect(() => {
    if (!selectedNodeId || !army.nodes.some((node) => node.id === selectedNodeId)) {
      onSelectedNodeChange(root?.id ?? null);
    }
  }, [army.nodes, onSelectedNodeChange, root?.id, selectedNodeId]);

  const renderTreeNode = (node: ArmyNode, depth = 0): ReactNode => {
    const children = childrenByParent.get(node.id) ?? [];
    const title = nodeTitle(node, unitMap, t('army.graph.unknownUnit'));
    const unit = node.unitId ? unitMap.get(node.unitId) : undefined;
    const points = nodePointCost(node, unitMap);
    const isSelected = node.id === selectedNode?.id;
    const canHaveUnits = node.kind !== 'unit';
    const canAddFormation = node.kind === 'army';
    const isRoot = node.kind === 'army';

    return (
      <Box key={node.id}>
        <ListItemButton
          selected={isSelected}
          onClick={() => onSelectedNodeChange(node.id)}
          sx={{
            pl: 1 + depth * 2,
            pr: 1,
            py: 0.75,
            borderRadius: 0.75,
            alignItems: 'flex-start',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ minWidth: 0, width: '100%', alignItems: 'center' }}>
            {unit ? (
              <UnitTreeImage unit={unit} />
            ) : (
              <Box color="primary.main" sx={{ mt: 0.2 }}>
                {kindIcons[node.kind]}
              </Box>
            )}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: isSelected ? 700 : 500 }}>
                {title}
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ mt: 0.35, flexWrap: 'wrap', rowGap: 0.5 }}>
                <Chip size="small" label={t(`army.graph.kinds.${node.kind}`)} />
                {node.quantity && node.quantity > 1 && <Chip size="small" label={`x${node.quantity}`} />}
                {points !== null && <Chip size="small" label={`${points} ${t('army.budget.points')}`} />}
              </Stack>
            </Box>
            <Stack direction="row" spacing={0.5} onClick={(event) => event.stopPropagation()}>
              {canHaveUnits && (
                <Tooltip title={t('army.units.add')}>
                  <IconButton size="small" onClick={() => setUnitDialogParentId(node.id)} aria-label={t('army.units.add')}>
                    <ShieldIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {canAddFormation && (
                <Tooltip title={t('army.graph.addFormation')}>
                  <IconButton size="small" onClick={() => setDialog({ mode: 'add', nodeId: node.id })} aria-label={t('army.graph.addFormation')}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t('army.graph.edit')}>
                <IconButton size="small" onClick={() => setDialog({ mode: 'edit', nodeId: node.id })} aria-label={t('army.graph.edit')}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {!isRoot && (
                <Tooltip title={t('common.delete')}>
                  <IconButton size="small" color="error" onClick={() => setNodeToDelete(node)} aria-label={t('common.delete')}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </ListItemButton>
        {children.map((child) => renderTreeNode(child, depth + 1))}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {t('army.graph.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('army.graph.instructions')}
      </Typography>

      <Paper variant="outlined" sx={{ p: 1, maxHeight: { md: 720 }, overflow: 'auto' }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>
          {t('army.graph.navigation')}
        </Typography>
        <List dense disablePadding>
          {root ? renderTreeNode(root) : null}
        </List>
      </Paper>

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

      <Dialog open={!!unitDialogParentId} onClose={() => setUnitDialogParentId(null)} fullWidth maxWidth="lg">
        <DialogTitle>{t('army.units.selectTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <ToggleButtonGroup
              value={selectedUnitType}
              exclusive
              onChange={(_event, value: UnitType | 'all' | null) => {
                if (value) setSelectedUnitType(value);
              }}
              size="small"
              sx={{ flexWrap: 'wrap', gap: 1, '& .MuiToggleButtonGroup-grouped': { border: 1, borderColor: 'divider', borderRadius: 0.75 } }}
            >
              <ToggleButton value="all">{t('common.all')}</ToggleButton>
              {availableUnitTypes.map((type) => (
                <ToggleButton key={type} value={type}>
                  {t(`units.types.${type}`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {unitDialogUnits.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
                  gap: 1.5,
                  maxHeight: '65vh',
                  overflow: 'auto',
                  pr: 0.5,
                }}
              >
                {unitDialogUnits.map((unit) => (
                  <Card key={unit.id} variant="outlined">
                    <CardActionArea
                      onClick={() => {
                        if (unitDialogParentId) onAddUnit(unitDialogParentId, unit.id);
                        setUnitDialogParentId(null);
                      }}
                      sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                    >
                      <UnitImage unit={unit} height={128} />
                      <CardContent sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {unit.name}
                        </Typography>
                        <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 0.75 }}>
                          <Chip size="small" label={t(`units.types.${unit.type}`)} />
                          <Chip size="small" color="secondary" label={`${unit.cost} ${t('army.budget.points')}`} />
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            ) : (
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">{t('units.noResults')}</Typography>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnitDialogParentId(null)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
}
