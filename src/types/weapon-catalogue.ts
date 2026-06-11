/**
 * Weapon catalogue entry types for the per-file content structure described in AGENT.md.
 * Pairs real-world reference data (caliber, muzzle velocity, historical rate of fire)
 * with the corresponding game firing profiles.
 */

import type { CatalogueEntryMeta } from './catalogue';
import type { WeaponProfile, WeaponRateOfFire, WeaponType } from './weapon';

/** A single range entry in an ammunition's historical penetration table. */
export interface WeaponPenetrationRangeRow {
  /** Range in meters. */
  rangeM: number;
  /** Penetration in mm at this range, against a plate at `penetrationAngleDeg`. Omitted where unknown. */
  penetrationMM?: number;
  /** Historical hit probability (%) under training conditions against a 2.5 x 2 m target. */
  hitProbabilityTraining?: number;
  /** Historical hit probability (%) under combat conditions against a 2.5 x 2 m target. */
  hitProbabilityCombat?: number;
}

/** Historical reference data for a single ammunition type, keyed by game profile id. */
export interface WeaponAmmunitionHistoricalProfile {
  /** Historical ammunition designation, e.g. "PzGr. 39". */
  name?: string;
  description?: string;
  projectileWeightKg?: number;
  explosiveChargeKg?: number;
  /** Angle of the reference armour plate in the penetration table, in degrees from the horizontal. */
  penetrationAngleDeg?: number;
  penetrationTable?: WeaponPenetrationRangeRow[];
}

/** Real-world reference data for a weapon. */
export interface WeaponHistoricalProfile {
  caliberMM?: number;
  /** Barrel length notation, e.g. "L/48". */
  barrelLength?: string;
  /** Mounting locations historically used, e.g. ["turret", "hull"]. */
  mounting?: string[];
  /** Muzzle velocity in m/s, keyed by ammunition type (e.g. "apcbc", "apcr"). */
  muzzleVelocityMps?: Record<string, number>;
  /** Real-world cadence reference; not used directly by combat resolution. */
  rateOfFirePerMinute?: WeaponRateOfFire;
  typicalAmmunition?: string[];
  /** Per-ammunition penetration reference data, keyed by game profile id (e.g. "apcbc"). */
  ammunition?: Record<string, WeaponAmmunitionHistoricalProfile>;
  sourceUrl?: string;
  notes?: string;
}

/** In-game profile for a weapon. */
export interface WeaponGameProfile {
  /** At least one firing profile. */
  profiles: WeaponProfile[];
}

/** A weapon catalogue entry, e.g. `src/data/weapons/german/75mm-kwk-40-l48.json`. */
export interface WeaponCatalogueEntry extends CatalogueEntryMeta {
  type: WeaponType;
  historical: WeaponHistoricalProfile;
  game: WeaponGameProfile;
}
