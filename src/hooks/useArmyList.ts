/**
 * useArmyList — manages the list of saved armies in localStorage.
 * Provides CRUD operations, budget calculation, and army export/import (FR-020/FR-021).
 * Export format: single Army object + top-level _version:1 saved as {name}.aow.json.
 * Import validation: requires _version===1, id, name, armyTypeId, units.
 */
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Army, ArmyBudget, ArmyType, ArmyUnit } from '../types/army';
import { Unit } from '../types/unit';
import { useLocalStorage } from './useLocalStorage';
import unitsData from '../data/units/units.json';

const ARMIES_KEY = 'aow:armies';
const SCHEMA_VERSION = 1;

interface ArmiesStore {
  _version: number;
  armies: Army[];
}

const DEFAULT_STORE: ArmiesStore = { _version: SCHEMA_VERSION, armies: [] };

const allUnits = unitsData.units as unknown as Unit[];

function findUnit(unitId: string): Unit | undefined {
  return allUnits.find((u) => u.id === unitId);
}

export interface UseArmyListResult {
  armies: Army[];
  createArmy: (name: string, armyTypeId: string) => Army;
  updateArmy: (army: Army) => void;
  deleteArmy: (id: string) => void;
  addUnit: (armyId: string, unitId: string) => void;
  removeUnit: (armyId: string, unitId: string) => void;
  computeBudget: (army: Army, armyType: ArmyType) => ArmyBudget;
  exportArmy: (army: Army) => void;
  importArmy: (file: File, onSuccess: (army: Army) => void, onError: (msg: string) => void) => void;
}

export function useArmyList(): UseArmyListResult {
  const [store, setStore] = useLocalStorage<ArmiesStore>(ARMIES_KEY, DEFAULT_STORE);

  const armies = store.armies;

  const saveArmies = useCallback(
    (updated: Army[]) => {
      setStore({ _version: SCHEMA_VERSION, armies: updated });
    },
    [setStore]
  );

  const createArmy = useCallback(
    (name: string, armyTypeId: string): Army => {
      const army: Army = {
        id: uuidv4(),
        name,
        armyTypeId,
        units: [],
        savedAt: new Date().toISOString(),
      };
      saveArmies([...armies, army]);
      return army;
    },
    [armies, saveArmies]
  );

  const updateArmy = useCallback(
    (updated: Army) => {
      saveArmies(armies.map((a) => (a.id === updated.id ? updated : a)));
    },
    [armies, saveArmies]
  );

  const deleteArmy = useCallback(
    (id: string) => {
      saveArmies(armies.filter((a) => a.id !== id));
    },
    [armies, saveArmies]
  );

  const addUnit = useCallback(
    (armyId: string, unitId: string) => {
      saveArmies(
        armies.map((a) => {
          if (a.id !== armyId) return a;
          const existing = a.units.find((u) => u.unitId === unitId);
          const updatedUnits: ArmyUnit[] = existing
            ? a.units.map((u) =>
                u.unitId === unitId ? { ...u, quantity: u.quantity + 1 } : u
              )
            : [...a.units, { unitId, quantity: 1 }];
          return { ...a, units: updatedUnits, savedAt: new Date().toISOString() };
        })
      );
    },
    [armies, saveArmies]
  );

  const removeUnit = useCallback(
    (armyId: string, unitId: string) => {
      saveArmies(
        armies.map((a) => {
          if (a.id !== armyId) return a;
          const updatedUnits = a.units
            .map((u) =>
              u.unitId === unitId ? { ...u, quantity: u.quantity - 1 } : u
            )
            .filter((u) => u.quantity > 0);
          return { ...a, units: updatedUnits, savedAt: new Date().toISOString() };
        })
      );
    },
    [armies, saveArmies]
  );

  const computeBudget = useCallback(
    (army: Army, armyType: ArmyType): ArmyBudget => {
      let spentPoints = 0;
      const poolSpend: Record<string, number> = {};
      armyType.resourcePools.forEach((p) => {
        poolSpend[p.key] = 0;
      });

      army.units.forEach(({ unitId, quantity }) => {
        const unit = findUnit(unitId);
        if (!unit) return;
        spentPoints += unit.cost * quantity;
        if (unit.resourceCosts) {
          Object.entries(unit.resourceCosts).forEach(([key, val]) => {
            poolSpend[key] = (poolSpend[key] ?? 0) + val * quantity;
          });
        }
      });

      const pools = armyType.resourcePools.map((p) => ({
        key: p.key,
        label: p.label,
        spent: poolSpend[p.key] ?? 0,
        max: p.max,
      }));

      return {
        totalPoints: armyType.pointBudget,
        spentPoints,
        remainingPoints: armyType.pointBudget - spentPoints,
        pools,
        pointsOverBudget: spentPoints > armyType.pointBudget,
      };
    },
    []
  );

  /** FR-020: Export a single army as {name}.aow.json */
  const exportArmy = useCallback((army: Army) => {
    const payload = { _version: SCHEMA_VERSION, ...army };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${army.name.replace(/\s+/g, '_')}.aow.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  /** FR-021: Import an army from a .aow.json file */
  const importArmy = useCallback(
    (file: File, onSuccess: (army: Army) => void, onError: (msg: string) => void) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const raw = e.target?.result;
          if (typeof raw !== 'string') throw new Error('unreadable');
          const parsed = JSON.parse(raw) as Record<string, unknown>;
          if (
            parsed._version !== 1 ||
            typeof parsed.id !== 'string' ||
            typeof parsed.name !== 'string' ||
            typeof parsed.armyTypeId !== 'string' ||
            !Array.isArray(parsed.units)
          ) {
            throw new Error('invalid');
          }
          const imported: Army = {
            id: parsed.id as string,
            name: parsed.name as string,
            armyTypeId: parsed.armyTypeId as string,
            units: parsed.units as ArmyUnit[],
            savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : new Date().toISOString(),
          };
          // Replace existing army with same id, or append
          const exists = armies.some((a) => a.id === imported.id);
          if (exists) {
            saveArmies(armies.map((a) => (a.id === imported.id ? imported : a)));
          } else {
            saveArmies([...armies, imported]);
          }
          onSuccess(imported);
        } catch {
          onError('import.error');
        }
      };
      reader.readAsText(file);
    },
    [armies, saveArmies]
  );

  return { armies, createArmy, updateArmy, deleteArmy, addUnit, removeUnit, computeBudget, exportArmy, importArmy };
}
