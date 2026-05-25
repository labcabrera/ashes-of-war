/**
 * Unit domain types for Ashes of War.
 * Defines the 12 unit types, TankProfile armour values, and the Unit entity.
 */

/** All valid unit type discriminants. */
export type UnitType =
  | 'infantry'
  | 'tank'
  | 'artillery'
  | 'motorised'
  | 'mechanised'
  | 'reconnaissance'
  | 'engineer'
  | 'artillery-towed'
  | 'sniper'
  | 'medic'
  | 'aircraft'
  | 'special';

/** Armour ratings for tank units (all values in mm). */
export interface TankProfile {
  front: number;
  side: number;
  rear: number;
  exposed: number;
}

/** A single unit entry in the unit roster. */
export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  faction: string;
  /** First year the unit was available (inclusive). */
  from: number;
  /** Last year the unit was available (inclusive). */
  to: number;
  /** Point cost. */
  cost: number;
  /** Optional resource costs keyed by ResourcePool.key. */
  resourceCosts?: Record<string, number>;
  /** Optional public image displayed in the unit detail panel. */
  imageUrl?: string;
  /** Armour profile — only present for tank units. */
  profile?: TankProfile;
}
