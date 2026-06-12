/**
 * Migration helpers for persisted Army Builder data.
 * Converts schema-v1 flat selected units into schema-v2 hierarchical graph nodes.
 */
import { v4 as uuidv4 } from 'uuid';
import { Army, ArmyNode } from '../../types/army';
import type { FactionId } from '../../types/faction';
import armyTypesData from '../../data/army-types/army-types.json';

export const ARMIES_SCHEMA_VERSION = 3;

const DEFAULT_POINT_BUDGET = 1000;
const armyTypeDefaults = new Map(
  armyTypesData.armyTypes.map((armyType) => [
    armyType.id,
    {
      faction: armyType.faction as FactionId | undefined,
      pointBudget: armyType.pointBudget,
    },
  ]),
);

interface LegacyArmyUnit {
  unitId: string;
  quantity: number;
}

interface LegacyArmy {
  id: string;
  name: string;
  armyTypeId: string;
  units: LegacyArmyUnit[];
  savedAt: string;
}

export interface ArmiesStore {
  _version: number;
  armies: Army[];
}

interface UnknownStore {
  _version?: unknown;
  armies?: unknown;
}

const nodeKinds = new Set(['army', 'company', 'platoon', 'section', 'unit']);

export const EMPTY_ARMIES_STORE: ArmiesStore = {
  _version: ARMIES_SCHEMA_VERSION,
  armies: [],
};

function isLegacyArmy(value: unknown): value is LegacyArmy {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LegacyArmy>;
  return (
    typeof candidate.id === 'string'
    && typeof candidate.name === 'string'
    && typeof candidate.armyTypeId === 'string'
    && Array.isArray(candidate.units)
  );
}

function isNode(value: unknown): value is ArmyNode {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ArmyNode>;
  return (
    typeof candidate.id === 'string'
    && typeof candidate.kind === 'string'
    && nodeKinds.has(candidate.kind)
    && typeof candidate.label === 'string'
    && (candidate.parentId === null || typeof candidate.parentId === 'string')
    && !!candidate.position
    && typeof candidate.position.x === 'number'
    && typeof candidate.position.y === 'number'
    && (
      candidate.kind !== 'unit'
      || (typeof candidate.unitId === 'string' && typeof candidate.quantity === 'number' && candidate.quantity >= 1)
    )
  );
}

function isValidHierarchy(nodes: ArmyNode[]): boolean {
  const ids = new Set(nodes.map((node) => node.id));
  const roots = nodes.filter((node) => node.kind === 'army' && node.parentId === null);
  if (roots.length !== 1 || ids.size !== nodes.length) return false;

  return nodes.every((node) => {
    if (node.kind === 'army') return node.id === roots[0]?.id && node.parentId === null;
    if (!node.parentId) return false;
    const parent = nodes.find((candidate) => candidate.id === node.parentId);
    if (!parent || parent.kind === 'unit') return false;

    const ancestry = new Set([node.id]);
    let current: ArmyNode | undefined = parent;
    while (current) {
      if (ancestry.has(current.id)) return false;
      ancestry.add(current.id);
      if (current.parentId === null) return current.id === roots[0]?.id;
      current = nodes.find((candidate) => candidate.id === current?.parentId);
    }
    return false;
  });
}

function isArmy(value: unknown): value is Army {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Army>;
  return (
    typeof candidate.id === 'string'
    && typeof candidate.name === 'string'
    && typeof candidate.armyTypeId === 'string'
    && (candidate.faction === undefined || typeof candidate.faction === 'string')
    && (candidate.pointBudget === undefined || (Number.isFinite(candidate.pointBudget) && candidate.pointBudget > 0))
    && Array.isArray(candidate.nodes)
    && candidate.nodes.every(isNode)
    && isValidHierarchy(candidate.nodes)
  );
}

function normalizeArmy(army: Army): Army {
  const defaults = armyTypeDefaults.get(army.armyTypeId);
  return {
    ...army,
    faction: army.faction ?? defaults?.faction,
    pointBudget: army.pointBudget ?? DEFAULT_POINT_BUDGET,
  };
}

function migrateLegacyArmy(army: LegacyArmy): Army {
  const rootId = uuidv4();
  const companyId = uuidv4();
  const rootNode: ArmyNode = {
    id: rootId,
    kind: 'army',
    label: army.name,
    parentId: null,
    position: { x: 320, y: 30 },
  };
  const companyNode: ArmyNode = {
    id: companyId,
    kind: 'company',
    label: 'Imported company',
    parentId: rootId,
    position: { x: 320, y: 180 },
  };
  const unitNodes: ArmyNode[] = army.units
    .filter(({ unitId, quantity }) => typeof unitId === 'string' && typeof quantity === 'number' && quantity > 0)
    .map(({ unitId, quantity }, index) => ({
      id: uuidv4(),
      kind: 'unit',
      label: '',
      parentId: companyId,
      unitId,
      quantity,
      position: { x: 80 + (index % 4) * 235, y: 330 + Math.floor(index / 4) * 135 },
    }));

  return {
    id: army.id,
    name: army.name,
    armyTypeId: army.armyTypeId,
    faction: armyTypeDefaults.get(army.armyTypeId)?.faction,
    pointBudget: DEFAULT_POINT_BUDGET,
    nodes: [rootNode, companyNode, ...unitNodes],
    savedAt: army.savedAt ?? new Date().toISOString(),
  };
}

/** Normalize stored localStorage data into the current hierarchical schema. */
export function migrateArmiesStore(raw: unknown): ArmiesStore {
  if (!raw || typeof raw !== 'object') return EMPTY_ARMIES_STORE;
  const store = raw as UnknownStore;
  if (!Array.isArray(store.armies)) return EMPTY_ARMIES_STORE;

  if (store._version === ARMIES_SCHEMA_VERSION) {
    return {
      _version: ARMIES_SCHEMA_VERSION,
      armies: store.armies.filter(isArmy).map(normalizeArmy),
    };
  }

  if (store._version === 2) {
    return {
      _version: ARMIES_SCHEMA_VERSION,
      armies: store.armies.filter(isArmy).map(normalizeArmy),
    };
  }

  if (store._version === 1) {
    return {
      _version: ARMIES_SCHEMA_VERSION,
      armies: store.armies.filter(isLegacyArmy).map(migrateLegacyArmy),
    };
  }

  return EMPTY_ARMIES_STORE;
}

export function isCurrentArmiesStore(raw: unknown): raw is ArmiesStore {
  const store = raw as UnknownStore;
  return (
    !!raw
    && typeof raw === 'object'
    && store._version === ARMIES_SCHEMA_VERSION
    && Array.isArray(store.armies)
    && store.armies.every(isArmy)
  );
}
