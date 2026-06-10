/**
 * ArmyBuilderPage composes saved forces, budgets, catalogue selection and the organization graph.
 */
import { useMemo, useState } from 'react';
import { Alert, Box, Paper, Snackbar, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useArmyList } from '../hooks/useArmyList';
import ArmyTypeSelector from '../components/army/ArmyTypeSelector';
import ArmyBudgetBar from '../components/army/ArmyBudgetBar';
import ArmyUnitPicker from '../components/army/ArmyUnitPicker';
import ArmySaveManager from '../components/army/ArmySaveManager';
import ArmyExportImport from '../components/army/ArmyExportImport';
import ArmyFlowEditor from '../components/army/ArmyFlowEditor';
import { Army, ArmyNode, ArmyType } from '../types/army';
import armyTypesData from '../data/army-types/army-types.json';
import { allUnits } from '../data/units';

const allArmyTypes = armyTypesData.armyTypes as unknown as ArmyType[];

function rootNode(army: Army): ArmyNode | undefined {
  return army.nodes.find((node) => node.kind === 'army');
}

export default function ArmyBuilderPage() {
  const { t } = useTranslation();
  const {
    armies,
    createArmy,
    deleteArmy,
    addFormation,
    addUnit,
    updateNode,
    deleteNode,
    positionNode,
    reparentNode,
    computeBudget,
    exportArmy,
    importArmy,
  } = useArmyList();

  const [selectedArmyTypeId, setSelectedArmyTypeId] = useState(allArmyTypes[0]?.id ?? '');
  const [activeArmyId, setActiveArmyId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({
    open: false,
    severity: 'success',
    message: '',
  });

  const armyType = useMemo(
    () => allArmyTypes.find((type) => type.id === selectedArmyTypeId) ?? allArmyTypes[0],
    [selectedArmyTypeId],
  ) as ArmyType;
  const activeArmy = useMemo(
    () => armies.find((army) => army.id === activeArmyId) ?? null,
    [activeArmyId, armies],
  );
  const unitMap = useMemo(() => new Map(allUnits.map((unit) => [unit.id, unit])), []);
  const budget = useMemo(
    () => (activeArmy ? computeBudget(activeArmy, armyType) : null),
    [activeArmy, armyType, computeBudget],
  );
  const effectiveSelectedNodeId = activeArmy?.nodes.some((node) => node.id === selectedNodeId)
    ? selectedNodeId
    : activeArmy ? rootNode(activeArmy)?.id ?? null : null;
  const selectedNode = activeArmy?.nodes.find((node) => node.id === effectiveSelectedNodeId);
  const canAttachUnit = !!selectedNode && selectedNode.kind !== 'unit';

  const handleCreate = (name: string) => {
    const army = createArmy(name, selectedArmyTypeId);
    setActiveArmyId(army.id);
    setSelectedNodeId(rootNode(army)?.id ?? null);
  };

  const handleSelect = (army: Army) => {
    setSelectedArmyTypeId(army.armyTypeId);
    setActiveArmyId(army.id);
    setSelectedNodeId(rootNode(army)?.id ?? null);
  };

  const handleDelete = (id: string) => {
    deleteArmy(id);
    if (activeArmyId === id) {
      setActiveArmyId(null);
      setSelectedNodeId(null);
    }
  };

  const handleAddUnit = (unitId: string) => {
    if (!activeArmy || !selectedNode || !canAttachUnit) return;
    addUnit(activeArmy.id, selectedNode.id, unitId);
  };

  const handleImport = (file: File) => {
    importArmy(
      file,
      (imported) => {
        setActiveArmyId(imported.id);
        setSelectedArmyTypeId(imported.armyTypeId);
        setSelectedNodeId(rootNode(imported)?.id ?? null);
        setSnack({ open: true, severity: 'success', message: t('army.import.success') });
      },
      () => setSnack({ open: true, severity: 'error', message: t('army.import.error') }),
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4">{t('army.title')}</Typography>
        <ArmyExportImport
          army={activeArmy}
          onExport={() => { if (activeArmy) exportArmy(activeArmy); }}
          onImport={handleImport}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <ArmyTypeSelector
          armyTypes={allArmyTypes}
          selectedId={selectedArmyTypeId}
          onChange={setSelectedArmyTypeId}
        />
      </Box>

      {budget && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('army.budget.title')}
          </Typography>
          <ArmyBudgetBar budget={budget} />
        </Paper>
      )}

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Stack spacing={2} sx={{ width: { xs: '100%', lg: 320 }, flexShrink: 0 }}>
          <Paper sx={{ p: 2 }}>
            <ArmySaveManager
              armies={armies}
              selectedId={activeArmyId}
              armyTypeId={selectedArmyTypeId}
              onSelect={handleSelect}
              onCreate={handleCreate}
              onDelete={handleDelete}
            />
          </Paper>

          <Paper sx={{ p: 2 }}>
            <ArmyUnitPicker
              allUnits={allUnits}
              armyType={armyType}
              selectedParentLabel={selectedNode?.label}
              canAdd={canAttachUnit}
              onAdd={handleAddUnit}
            />
          </Paper>
        </Stack>

        <Paper sx={{ p: 2, flex: 1, width: { xs: '100%', lg: 'auto' }, minWidth: 0 }}>
          {activeArmy ? (
            <ArmyFlowEditor
              army={activeArmy}
              unitMap={unitMap}
              selectedNodeId={effectiveSelectedNodeId}
              onSelectedNodeChange={setSelectedNodeId}
              onAddFormation={(parentId, kind, label) => addFormation(activeArmy.id, parentId, kind, label)}
              onUpdateNode={(nodeId, label, quantity) => updateNode(activeArmy.id, nodeId, label, quantity)}
              onDeleteNode={(nodeId) => deleteNode(activeArmy.id, nodeId)}
              onPositionNode={(nodeId, position) => positionNode(activeArmy.id, nodeId, position)}
              onReparentNode={(nodeId, parentId) => reparentNode(activeArmy.id, nodeId, parentId)}
            />
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">{t('army.graph.createPrompt')}</Typography>
            </Box>
          )}
        </Paper>
      </Stack>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((state) => ({ ...state, open: false }))}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((state) => ({ ...state, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
