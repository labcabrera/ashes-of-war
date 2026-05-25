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

/** A unit instance inside an army, with its quantity. */
export interface ArmyUnit {
  unitId: string;
  quantity: number;
}

/** A saved army. */
export interface Army {
  id: string;
  name: string;
  armyTypeId: string;
  units: ArmyUnit[];
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
