/**
 * Weapon catalogue entry types for the per-file content structure described in AGENT.md.
 * Pairs real-world reference data (caliber, muzzle velocity, historical rate of fire)
 * with the corresponding game firing profiles.
 */

import type { CatalogueEntryMeta } from './catalogue';
import type { WeaponProfile, WeaponRateOfFire, WeaponType } from './weapon';

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
