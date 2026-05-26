/**
 * useArmyList manages hierarchical saved armies in localStorage.
 * It provides graph editing operations, schema migration, budget totals, and import/export.
 */
import { useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Army, ArmyBudget, ArmyNode, ArmyNodeKind, ArmyNodePosition, ArmyType } from '../types/army';
import { Unit } from '../types/unit';
import { useLocalStorage } from './useLocalStorage';
import {
  ARMIES_SCHEMA_VERSION,
  EMPTY_ARMIES_STORE,
  isCurrentArmiesStore,
  migrateArmiesStore,
} from './migrations/armies';
import unitsData from '../data/units/units.json';

const ARMIES_KEY = 'aow:armies';
const allUnits = unitsData.units as unknown as Unit[];

function findUnit(unitId: string): Unit | undefined {
  return allUnits.find((unit) => unit.id === unitId);
}

function initialChildPosition(nodes: ArmyNode[], parentId: string): ArmyNodePosition {
  const parent = nodes.find((node) => node.id === parentId);
  const siblings = nodes.filter((node) => node.parentId === parentId);
  const index = siblings.length;
  return {
    x: (parent?.position.x ?? 280) - 180 + (index % 3) * 220,
    y: (parent?.position.y ?? 30) + 145 + Math.floor(index / 3) * 135,
  };
}

function descendants(nodes: ArmyNode[], nodeId: string): Set<string> {
  const removed = new Set([nodeId]);
  let foundChild = true;
  while (foundChild) {
    foundChild = false;
    nodes.forEach((node) => {
      if (node.parentId && removed.has(node.parentId) && !removed.has(node.id)) {
        removed.add(node.id);
        foundChild = true;
      }
    });
  }
  return removed;
}

function cloneImportedArmy(army: Army): Army {
  const nodeIds = new Map(army.nodes.map((node) => [node.id, uuidv4()]));
  return {
    ...army,
    id: uuidv4(),
    nodes: army.nodes.map((node) => ({
      ...node,
      id: nodeIds.get(node.id) as string,
      parentId: node.parentId ? nodeIds.get(node.parentId) ?? null : null,
    })),
    savedAt: new Date().toISOString(),
  };
}

export interface UseArmyListResult {
  armies: Army[];
  createArmy: (name: string, armyTypeId: string) => Army;
  deleteArmy: (id: string) => void;
  addFormation: (armyId: string, parentId: string, kind: Exclude<ArmyNodeKind, 'army' | 'unit'>, label: string) => void;
  addUnit: (armyId: string, parentId: string, unitId: string) => void;
  updateNode: (armyId: string, nodeId: string, label: string, quantity?: number) => void;
  deleteNode: (armyId: string, nodeId: string) => void;
  positionNode: (armyId: string, nodeId: string, position: ArmyNodePosition) => void;
  reparentNode: (armyId: string, nodeId: string, parentId: string) => boolean;
  computeBudget: (army: Army, armyType: ArmyType) => ArmyBudget;
  exportArmy: (army: Army) => void;
  importArmy: (file: File, onSuccess: (army: Army) => void, onError: (msg: string) => void) => void;
}

export function useArmyList(): UseArmyListResult {
  const [storedStore, setStoredStore] = useLocalStorage<unknown>(ARMIES_KEY, EMPTY_ARMIES_STORE);
  const store = useMemo(() => migrateArmiesStore(storedStore), [storedStore]);
  const armies = store.armies;

  useEffect(() => {
    if (!isCurrentArmiesStore(storedStore)) {
      setStoredStore(store);
    }
  }, [setStoredStore, store, storedStore]);

  const saveArmies = useCallback(
    (updated: Army[]) => setStoredStore({ _version: ARMIES_SCHEMA_VERSION, armies: updated }),
    [setStoredStore],
  );

  const updateOneArmy = useCallback(
    (armyId: string, change: (army: Army) => Army) => {
      saveArmies(armies.map((army) => (army.id === armyId ? change(army) : army)));
    },
    [armies, saveArmies],
  );

  const createArmy = useCallback(
    (name: string, armyTypeId: string): Army => {
      const root: ArmyNode = {
        id: uuidv4(),
        kind: 'army',
        label: name,
        parentId: null,
        position: { x: 360, y: 35 },
      };
      const army: Army = {
        id: uuidv4(),
        name,
        armyTypeId,
        nodes: [root],
        savedAt: new Date().toISOString(),
      };
      saveArmies([...armies, army]);
      return army;
    },
    [armies, saveArmies],
  );

  const deleteArmy = useCallback(
    (id: string) => saveArmies(armies.filter((army) => army.id !== id)),
    [armies, saveArmies],
  );

  const addFormation = useCallback(
    (armyId: string, parentId: string, kind: Exclude<ArmyNodeKind, 'army' | 'unit'>, label: string) => {
      updateOneArmy(armyId, (army) => {
        const parent = army.nodes.find((node) => node.id === parentId);
        if (!parent || parent.kind === 'unit') return army;
        return {
          ...army,
          nodes: [
            ...army.nodes,
            {
              id: uuidv4(),
              kind,
              label,
              parentId,
              position: initialChildPosition(army.nodes, parentId),
            },
          ],
          savedAt: new Date().toISOString(),
        };
      });
    },
    [updateOneArmy],
  );

  const addUnit = useCallback(
    (armyId: string, parentId: string, unitId: string) => {
      const unit = findUnit(unitId);
      if (!unit) return;
      updateOneArmy(armyId, (army) => {
        const parent = army.nodes.find((node) => node.id === parentId);
        if (!parent || parent.kind === 'unit') return army;
        return {
          ...army,
          nodes: [
            ...army.nodes,
            {
              id: uuidv4(),
              kind: 'unit',
              label: unit.name,
              parentId,
              unitId,
              quantity: 1,
              position: initialChildPosition(army.nodes, parentId),
            },
          ],
          savedAt: new Date().toISOString(),
        };
      });
    },
    [updateOneArmy],
  );

  const updateNode = useCallback(
    (armyId: string, nodeId: string, label: string, quantity?: number) => {
      updateOneArmy(armyId, (army) => {
        const updatedNodes = army.nodes.map((node) => {
          if (node.id !== nodeId) return node;
          if (node.kind === 'unit') {
            return { ...node, label, quantity: Math.max(1, Math.floor(quantity ?? 1)) };
          }
          return { ...node, label };
        });
        const updatedNode = updatedNodes.find((node) => node.id === nodeId);
        return {
          ...army,
          name: updatedNode?.kind === 'army' ? label : army.name,
          nodes: updatedNodes,
          savedAt: new Date().toISOString(),
        };
      });
    },
    [updateOneArmy],
  );

  const deleteNode = useCallback(
    (armyId: string, nodeId: string) => {
      updateOneArmy(armyId, (army) => {
        const target = army.nodes.find((node) => node.id === nodeId);
        if (!target || target.kind === 'army') return army;
        const removed = descendants(army.nodes, nodeId);
        return {
          ...army,
          nodes: army.nodes.filter((node) => !removed.has(node.id)),
          savedAt: new Date().toISOString(),
        };
      });
    },
    [updateOneArmy],
  );

  const positionNode = useCallback(
    (armyId: string, nodeId: string, position: ArmyNodePosition) => {
      updateOneArmy(armyId, (army) => ({
        ...army,
        nodes: army.nodes.map((node) => (node.id === nodeId ? { ...node, position } : node)),
        savedAt: new Date().toISOString(),
      }));
    },
    [updateOneArmy],
  );

  const reparentNode = useCallback(
    (armyId: string, nodeId: string, parentId: string): boolean => {
      const army = armies.find((entry) => entry.id === armyId);
      const node = army?.nodes.find((entry) => entry.id === nodeId);
      const parent = army?.nodes.find((entry) => entry.id === parentId);
      if (!army || !node || !parent || node.kind === 'army' || parent.kind === 'unit' || node.id === parent.id) {
        return false;
      }
      if (descendants(army.nodes, node.id).has(parent.id)) {
        return false;
      }
      updateOneArmy(armyId, (current) => ({
        ...current,
        nodes: current.nodes.map((entry) => (
          entry.id === nodeId ? { ...entry, parentId } : entry
        )),
        savedAt: new Date().toISOString(),
      }));
      return true;
    },
    [armies, updateOneArmy],
  );

  const computeBudget = useCallback(
    (army: Army, armyType: ArmyType): ArmyBudget => {
      let spentPoints = 0;
      const poolSpend: Record<string, number> = {};
      armyType.resourcePools.forEach((pool) => { poolSpend[pool.key] = 0; });

      army.nodes.filter((node) => node.kind === 'unit' && node.unitId).forEach((node) => {
        const unit = findUnit(node.unitId as string);
        const quantity = node.quantity ?? 1;
        if (!unit) return;
        spentPoints += unit.cost * quantity;
        Object.entries(unit.resourceCosts ?? {}).forEach(([key, value]) => {
          poolSpend[key] = (poolSpend[key] ?? 0) + value * quantity;
        });
      });

      return {
        totalPoints: armyType.pointBudget,
        spentPoints,
        remainingPoints: armyType.pointBudget - spentPoints,
        pools: armyType.resourcePools.map((pool) => ({
          key: pool.key,
          label: pool.label,
          spent: poolSpend[pool.key] ?? 0,
          max: pool.max,
        })),
        pointsOverBudget: spentPoints > armyType.pointBudget,
      };
    },
    [],
  );

  const exportArmy = useCallback((army: Army) => {
    const payload = { _version: ARMIES_SCHEMA_VERSION, ...army };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${army.name.replace(/\s+/g, '_')}.aow.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  const importArmy = useCallback(
    (file: File, onSuccess: (army: Army) => void, onError: (msg: string) => void) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const raw = event.target?.result;
          if (typeof raw !== 'string') throw new Error('unreadable');
          const parsed = JSON.parse(raw) as Record<string, unknown>;
          const normalized = migrateArmiesStore({ _version: parsed._version, armies: [parsed] });
          if (normalized.armies.length !== 1) throw new Error('invalid');
          const imported = cloneImportedArmy(normalized.armies[0] as Army);
          saveArmies([...armies, imported]);
          onSuccess(imported);
        } catch {
          onError('import.error');
        }
      };
      reader.readAsText(file);
    },
    [armies, saveArmies],
  );

  return {
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
  };
}
