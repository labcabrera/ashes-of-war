/**
 * ArmyBuilderPage composes saved forces, budgets, catalogue selection and the organization graph.
 */
import { useMemo, useState } from 'react';
import { Alert, Box, Paper, Snackbar, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useArmyList } from '../hooks/useArmyList';
import ArmyBudgetBar from '../components/army/ArmyBudgetBar';
import ArmySaveManager from '../components/army/ArmySaveManager';
import ArmyExportImport from '../components/army/ArmyExportImport';
import ArmyHierarchyEditor from '../components/army/ArmyHierarchyEditor';
import { Army, ArmyNode, ArmyType } from '../types/army';
import type { FactionId } from '../types/faction';
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
    computeBudget,
    exportArmy,
    importArmy,
  } = useArmyList();

  const [activeArmyId, setActiveArmyId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({
    open: false,
    severity: 'success',
    message: '',
  });

  const activeArmy = useMemo(
    () => armies.find((army) => army.id === activeArmyId) ?? null,
    [activeArmyId, armies],
  );
  const allowedFactionIds = useMemo(
    () => Array.from(new Set(allUnits.map((unit) => unit.faction))) as FactionId[],
    [],
  );
  const armyType = useMemo(() => {
    const fallbackType = allArmyTypes.find((type) => type.faction === activeArmy?.faction) ?? allArmyTypes[0];
    return {
      id: activeArmy?.armyTypeId ?? fallbackType?.id ?? 'custom',
      name: activeArmy?.name ?? fallbackType?.name ?? 'Custom Army',
      description: fallbackType?.description ?? '',
      faction: activeArmy?.faction ?? fallbackType?.faction,
      yearRange: fallbackType?.yearRange,
      pointBudget: activeArmy?.pointBudget ?? 1000,
      resourcePools: fallbackType?.resourcePools ?? [],
    } as ArmyType;
  }, [activeArmy]);
  const unitMap = useMemo(() => new Map(allUnits.map((unit) => [unit.id, unit])), []);
  const budget = useMemo(
    () => (activeArmy ? computeBudget(activeArmy, armyType) : null),
    [activeArmy, armyType, computeBudget],
  );
  const effectiveSelectedNodeId = activeArmy?.nodes.some((node) => node.id === selectedNodeId)
    ? selectedNodeId
    : activeArmy ? rootNode(activeArmy)?.id ?? null : null;

  const handleCreate = (name: string, faction: FactionId, pointBudget: number) => {
    const army = createArmy(name, faction, pointBudget);
    setActiveArmyId(army.id);
    setSelectedNodeId(rootNode(army)?.id ?? null);
  };

  const handleSelect = (army: Army) => {
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

  const handleImport = (file: File) => {
    importArmy(
      file,
      (imported) => {
        setActiveArmyId(imported.id);
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
              onSelect={handleSelect}
              onCreate={handleCreate}
              onDelete={handleDelete}
              allowedFactionIds={allowedFactionIds}
            />
          </Paper>
        </Stack>

        <Paper sx={{ p: 2, flex: 1, width: { xs: '100%', lg: 'auto' }, minWidth: 0 }}>
          {activeArmy ? (
            <ArmyHierarchyEditor
              army={activeArmy}
              unitMap={unitMap}
              allUnits={allUnits}
              armyFaction={armyType.faction}
              selectedNodeId={effectiveSelectedNodeId}
              onSelectedNodeChange={setSelectedNodeId}
              onAddFormation={(parentId, kind, label) => addFormation(activeArmy.id, parentId, kind, label)}
              onAddUnit={(parentId, unitId) => addUnit(activeArmy.id, parentId, unitId)}
              onUpdateNode={(nodeId, label, quantity) => updateNode(activeArmy.id, nodeId, label, quantity)}
              onDeleteNode={(nodeId) => deleteNode(activeArmy.id, nodeId)}
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
