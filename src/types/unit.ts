/**
 * Unit domain types for Ashes of War.
 * Defines unit categories, infantry bases, armour values, and roster entries.
 */

import type { WeaponFeatureModifier } from './weapon';

/** All valid unit type discriminants. */
export type UnitType =
  | 'infantry'
  | 'tank'
  | 'tank-destroyer'
  | 'assault-gun'
  | 'self-propelled-artillery'
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

/** Movement ratings used by the game for each terrain and operating pace. */
export interface MovementProfile {
  tactical: number;
  cruise: number;
  maximum: number;
  offRoad: number;
}

/** Classification of how a unit carries or mounts an assigned weapon. */
export type UnitWeaponMountType = 'normal' | 'turret' | 'coaxial' | 'hull';

/** A reference to a weapon from the static weapon catalogue. */
export interface UnitWeapon {
  id: string;
  count: number;
  type: UnitWeaponMountType;
  features?: WeaponFeatureModifier[];
}

/** A grouped infantry element carrying members and assigned weapons. */
export interface InfantryBase {
  members: number;
  weapons: UnitWeapon[];
}

/** Common fields included in every roster entry. */
interface BaseUnitFields {
  id: string;
  name: string;
  faction: string;
  /** First year the unit was available (inclusive). */
  from: number;
  /** Last year the unit was available (inclusive). */
  to: number;
  /** Point cost. */
  cost: number;
  /** Required movement ratings for the unit. */
  movement: MovementProfile;
  /** Optional resource costs keyed by ResourcePool.key. */
  resourceCosts?: Record<string, number>;
  /** Optional public image displayed in the unit detail panel. */
  imageUrl?: string;
  /** Optional rule keywords (e.g. 'low-reliability', 'veteran'). */
  keywords?: string[];
}

/** Infantry roster entries organised into required bases. */
export interface InfantryUnit extends BaseUnitFields {
  type: 'infantry';
  bases: InfantryBase[];
  weapons?: never;
  profile?: never;
}

/** Roster entries that are not infantry formations. */
export interface NonInfantryUnit extends BaseUnitFields {
  type: Exclude<UnitType, 'infantry'>;
  bases?: never;
  /** Optional weapon assignments resolved against the weapon catalogue. */
  weapons?: UnitWeapon[];
  /** Armour profile — only present for tank units. */
  profile?: TankProfile;
}

/** A unit roster entry, discriminated by its category. */
export type Unit = InfantryUnit | NonInfantryUnit;
