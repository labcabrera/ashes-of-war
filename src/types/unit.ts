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

/** Armour details for one vehicle facing. */
export interface Armor {
  /** Game-facing armour rating used by combat resolution. */
  value: number;
  /** Historical or representative armour thickness in millimetres. */
  armorMM: number;
  /** Representative armour plate inclination in degrees. */
  armorInclination: number;
  /** Optional context for ranges, curved mantlets, or exposed weak spots. */
  notes?: string;
}

/** Armour ratings for armoured vehicle units. */
export interface TankProfile {
  front: Armor;
  side: Armor;
  rear: Armor;
  exposed: Armor;
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

/** Vehicle and support roster entries that are not infantry formations. */
export interface VehicleUnit extends BaseUnitFields {
  type: Exclude<UnitType, 'infantry'>;
  bases?: never;
  /** Optional weapon assignments resolved against the weapon catalogue. */
  weapons?: UnitWeapon[];
  /** Optional armour profile for armoured vehicle entries. */
  profile?: TankProfile;
}

/** A unit roster entry, discriminated by its category. */
export type Unit = InfantryUnit | VehicleUnit;
