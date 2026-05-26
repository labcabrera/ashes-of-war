/**
 * Army domain types for Ashes of War.
 * Covers resource pools, army types, individual armies, and budget tracking.
 */

/** A named resource pool that limits how many of a particular resource type can be spent. */
export interface ResourcePool {
  key: string;
  /** i18n key for the label. */
  label: string;
  max: number;
}

/** A pre-defined army template with its point budget and resource pools. */
export interface ArmyType {
  id: string;
  name: string;
  description: string;
  pointBudget: number;
  resourcePools: ResourcePool[];
  /** Optional faction filter applied when building this army. */
  faction?: string;
}

/** Kinds of hierarchical organization elements available in the visual editor. */
export type ArmyNodeKind = 'army' | 'company' | 'platoon' | 'section' | 'unit';

/** Persisted canvas coordinates for one organization element. */
export interface ArmyNodePosition {
  x: number;
  y: number;
}

/** An organizational element or individual catalogue-unit occurrence in an army graph. */
export interface ArmyNode {
  id: string;
  kind: ArmyNodeKind;
  label: string;
  /** The army node is the only element without a parent. */
  parentId: string | null;
  position: ArmyNodePosition;
  /** Defined only for nodes of kind `unit`. */
  unitId?: string;
  /** Defined only for nodes of kind `unit`. */
  quantity?: number;
}

/** A saved army. */
export interface Army {
  id: string;
  name: string;
  armyTypeId: string;
  nodes: ArmyNode[];
  savedAt: string;
}

/** Computed budget snapshot for display. */
export interface ArmyBudget {
  totalPoints: number;
  spentPoints: number;
  remainingPoints: number;
  pools: Array<{ key: string; label: string; spent: number; max: number }>;
  pointsOverBudget: boolean;
}
