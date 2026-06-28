/**
 * Unit domain types for Ashes of War.
 * Defines unit categories, armor values, movement, weapons, and roster entries.
 */

import type { FactionId } from './faction';
import type { WeaponFeatureModifier } from './weapon';
import type { UnitKeyword } from './keyword';

export type { UnitKeyword } from './keyword';

/** All valid unit type discriminants. */
export type UnitType =
  | 'infantry'
  | 'tank'
  | 'tank-destroyer'
  | 'assault-gun'
  | 'sp-artillery'
  | 'sp-anti-aircraft'
  | 'mechanised'
  | 'motorised'
  | 'towed-artillery'
  | 'towed-anti-tank'
  | 'towed-anti-aircraft'
  | 'aircraft';

/** Ordered list of all UnitType values for use in filters and UI. */
export const UNIT_TYPES: UnitType[] = [
  'infantry',
  'tank',
  'tank-destroyer',
  'assault-gun',
  'sp-artillery',
  'sp-anti-aircraft',
  'mechanised',
  'motorised',
  'towed-artillery',
  'towed-anti-tank',
  'towed-anti-aircraft',
  'aircraft',
];

/** Armor details for one vehicle facing. */
export interface ArmorFacing {
  /** Game-facing armor rating used by combat resolution. */
  value: number;
  /** Historical or representative armor thickness in millimetres. */
  armorMM: number;
  /** Representative armor plate inclination in degrees. */
  armorInclination: number;
  /** Optional context for ranges, curved mantlets, or exposed weak spots. */
  notes?: string;
}

/** Armor ratings for armored vehicle units. */
export interface UnitArmorProfile {
  front: ArmorFacing;
  side: ArmorFacing;
  rear: ArmorFacing;
  exposed: ArmorFacing;
}

/** @deprecated Use ArmorFacing. */
export type Armor = ArmorFacing;

/** @deprecated Use UnitArmorProfile. */
export type TankProfile = UnitArmorProfile;

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
  /** Optional image path used by catalogue and army cards. */
  imageUrl?: string;
  /** Point cost. */
  cost: number;
  /** Required movement ratings for the unit. */
  movement: MovementProfile;
  /** Resistance to organization loss, expressed as the required check value. */
  resilience: number;
  /** Optional threshold used to recover lost organization points. */
  recover?: number;
  /** Optional morale threshold used when the unit suffers heavy casualties. */
  morale?: number;
  /** Optional vehicle capability to cross obstacles or force through rough terrain. */
  overrun?: number;
  /** Optional resource costs keyed by ResourcePool.key. */
  resourceCosts?: Record<string, number>;
  /** Optional rule keywords (e.g. 'low-reliability', 'veteran'). */
  keywords?: UnitKeyword[];
}

/** Infantry roster entries with members and assigned weapons. */
export interface InfantryUnit extends BaseUnitFields {
  type: 'infantry';
  members: number;
  casualtiesThreshold: number;
  weapons?: UnitWeapon[];
  armor?: never;
}

/** Vehicle and support roster entries that are not infantry formations. */
export interface VehicleUnit extends BaseUnitFields {
  type: Exclude<UnitType, 'infantry'>;
  /** Required for non-vehicle support units that do not have an armour profile. */
  casualtiesThreshold?: number;
  /** Optional weapon assignments resolved against the weapon catalogue. */
  weapons?: UnitWeapon[];
  /** Optional armor profile for armored vehicle entries. */
  armor?: UnitArmorProfile;
}

/** A unit roster entry, discriminated by its category. */
export type Unit = InfantryUnit | VehicleUnit;
