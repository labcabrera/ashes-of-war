/**
 * Unit domain types for Ashes of War.
 * Defines unit categories, armour values, movement, weapons, and roster entries.
 */

import type { FactionId } from './faction';
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

/** Movement rating for one operating pace across terrain types. */
export interface MovementSpeedProfile {
  road: number;
  crossCountry: number;
  rough: number;
}

/** Movement ratings used by the game for each operating pace and terrain. */
export interface MovementProfile {
  tactical: MovementSpeedProfile;
  cruise: MovementSpeedProfile;
  dash: MovementSpeedProfile;
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

/** Common fields included in every roster entry. */
interface BaseUnitFields {
  id: string;
  name: string;
  faction: FactionId;
  /** First year the unit was available (inclusive). */
  from: number;
  /** Last year the unit was available (inclusive). */
  to: number;
  /** Point cost. */
  cost: number;
  /** Required movement ratings for the unit. */
  movement: MovementProfile;
  /** Organization loss threshold used by morale and disruption rules. */
  organizationThreshold: number;
  /** Optional resource costs keyed by ResourcePool.key. */
  resourceCosts?: Record<string, number>;
  /** Optional public image displayed in the unit detail panel. */
  imageUrl?: string;
  /** Optional rule keywords (e.g. 'low-reliability', 'veteran'). */
  keywords?: string[];
}

/** Infantry roster entries with combatants and assigned weapons. */
export interface InfantryUnit extends BaseUnitFields {
  type: 'infantry';
  combatants: number;
  casualtiesThreshold: number;
  weapons?: UnitWeapon[];
  profile?: never;
}

/** Vehicle and support roster entries that are not infantry formations. */
export interface VehicleUnit extends BaseUnitFields {
  type: Exclude<UnitType, 'infantry'>;
  /** Required for non-vehicle support units that do not have an armour profile. */
  casualtiesThreshold?: number;
  /** Optional weapon assignments resolved against the weapon catalogue. */
  weapons?: UnitWeapon[];
  /** Optional armour profile for armoured vehicle entries. */
  profile?: TankProfile;
}

/** A unit roster entry, discriminated by its category. */
export type Unit = InfantryUnit | VehicleUnit;
