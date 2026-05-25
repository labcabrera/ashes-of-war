/**
 * ArmyBuilderPage — full army builder combining all army components.
 * Handles army type selection, unit picking, budget tracking, save/load, and export/import.
 */
import { useMemo, useState } from 'react';
import { Box, Typography, Paper, Snackbar, Alert, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useArmyList } from '../hooks/useArmyList';
import ArmyTypeSelector from '../components/army/ArmyTypeSelector';
import ArmyBudgetBar from '../components/army/ArmyBudgetBar';
import ArmyUnitPicker from '../components/army/ArmyUnitPicker';
import ArmyUnitList from '../components/army/ArmyUnitList';
import ArmySaveManager from '../components/army/ArmySaveManager';
import ArmyExportImport from '../components/army/ArmyExportImport';
import { Army, ArmyType } from '../types/army';
import { Unit } from '../types/unit';
import armyTypesData from '../data/army-types/army-types.json';
import unitsData from '../data/units/units.json';

const allArmyTypes = armyTypesData.armyTypes as unknown as ArmyType[];
const allUnits = unitsData.units as unknown as Unit[];

export default function ArmyBuilderPage() {
  const { t } = useTranslation();
  const { armies, createArmy, deleteArmy, addUnit, removeUnit, computeBudget, exportArmy, importArmy } =
    useArmyList();

  const [selectedArmyTypeId, setSelectedArmyTypeId] = useState(allArmyTypes[0]?.id ?? '');
  const [activeArmy, setActiveArmy] = useState<Army | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({
    open: false, severity: 'success', message: '',
  });

  const armyType = useMemo(
    () => allArmyTypes.find((at) => at.id === selectedArmyTypeId) ?? allArmyTypes[0],
    [selectedArmyTypeId]
  ) as ArmyType;

  const unitMap = useMemo(
    () => new Map(allUnits.map((u) => [u.id, u])),
    []
  );

  const budget = useMemo(
    () => (activeArmy && armyType ? computeBudget(activeArmy, armyType) : null),
    [activeArmy, armyType, computeBudget]
  );

  const handleCreate = (name: string) => {
    const army = createArmy(name, selectedArmyTypeId);
    setActiveArmy(army);
  };

  const handleSelect = (army: Army) => {
    setSelectedArmyTypeId(army.armyTypeId);
    setActiveArmy(army);
  };

  const handleDelete = (id: string) => {
    deleteArmy(id);
    if (activeArmy?.id === id) setActiveArmy(null);
  };

  const handleAddUnit = (unitId: string) => {
    if (!activeArmy) return;
    addUnit(activeArmy.id, unitId);
    setActiveArmy((prev) => {
      if (!prev) return prev;
      const existing = prev.units.find((u) => u.unitId === unitId);
      const updatedUnits = existing
        ? prev.units.map((u) => u.unitId === unitId ? { ...u, quantity: u.quantity + 1 } : u)
        : [...prev.units, { unitId, quantity: 1 }];
      return { ...prev, units: updatedUnits };
    });
  };

  const handleRemoveUnit = (unitId: string) => {
    if (!activeArmy) return;
    removeUnit(activeArmy.id, unitId);
    setActiveArmy((prev) => {
      if (!prev) return prev;
      const updatedUnits = prev.units
        .map((u) => u.unitId === unitId ? { ...u, quantity: u.quantity - 1 } : u)
        .filter((u) => u.quantity > 0);
      return { ...prev, units: updatedUnits };
    });
  };

  const handleExport = () => {
    if (!activeArmy) return;
    exportArmy(activeArmy);
  };

  const handleImport = (file: File) => {
    importArmy(
      file,
      (imported) => {
        setActiveArmy(imported);
        setSelectedArmyTypeId(imported.armyTypeId);
        setSnack({ open: true, severity: 'success', message: t('army.import.success') });
      },
      () => setSnack({ open: true, severity: 'error', message: t('army.import.error') })
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4">{t('army.title')}</Typography>
        <ArmyExportImport army={activeArmy} onExport={handleExport} onImport={handleImport} />
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

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ flex: '1 1 280px' }}>
          <Paper sx={{ p: 2 }}>
            <ArmySaveManager
              armies={armies}
              selectedId={activeArmy?.id ?? null}
              armyTypeId={selectedArmyTypeId}
              onSelect={handleSelect}
              onCreate={handleCreate}
              onDelete={handleDelete}
            />
          </Paper>
        </Box>

        <Box sx={{ flex: '1 1 280px' }}>
          <Paper sx={{ p: 2 }}>
            <ArmyUnitPicker
              allUnits={allUnits}
              armyType={armyType}
              onAdd={handleAddUnit}
            />
          </Paper>
        </Box>

        <Box sx={{ flex: '1 1 280px' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('army.units.title')}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {activeArmy ? (
              <ArmyUnitList
                armyUnits={activeArmy.units}
                unitMap={unitMap}
                onRemove={handleRemoveUnit}
              />
            ) : (
              <Typography color="text.secondary" variant="body2">
                {t('army.save.title')}
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
