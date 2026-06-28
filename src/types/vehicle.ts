/**
 * Vehicle catalogue entry types for the per-file content structure described in AGENT.md.
 * Pairs real-world historical reference data with the corresponding game profile.
 */

import type {
  ArmorFacingGame,
  ArmorFacingHistorical,
  ArmorProfile,
  CatalogueEntryMeta,
  MovementProfile,
} from './catalogue';
import type { UnitKeyword, UnitType, UnitWeapon } from './unit';

/** All vehicle and support categories (every UnitType except infantry). */
export type VehicleType = Exclude<UnitType, 'infantry'>;

/** Real-world reference data for a vehicle. */
export interface VehicleHistoricalProfile {
  manufacturer?: string;
  modelFamily?: string;
  /** Crew complement. */
  crew?: number;
  combatWeightTons?: number;
  engine?: string;
  unitsBuilt?: number;
  /** First year (inclusive) of series production. */
  productionStart?: number;
  /** Last year (inclusive) of series production. */
  productionEnd?: number;
  /** Maximum theoretical speeds in km/h. Omitted for towed weapons and aircraft. */
  speedKmh?: {
    road: number;
    offRoad: number;
    sustainedMarch: number;
  };
  /** Required for armoured types (tank, tank-destroyer, assault-gun, sp-artillery, sp-anti-aircraft). */
  armor?: ArmorProfile<ArmorFacingHistorical>;
  sourceUrl?: string;
}

/** In-game profile for a vehicle. */
export interface VehicleGameProfile {
  /** Point cost. */
  cost: number;
  /** Resistance to organization loss, expressed as the required check value. */
  resilience?: number;
  /** @deprecated Use resilience. */
  organizationThreshold?: number;
  /** Optional threshold used to recover lost organization points. */
  recover?: number;
  /** Optional morale threshold used when the unit suffers heavy casualties. */
  morale?: number;
  /** Optional vehicle capability to cross obstacles or force through rough terrain. */
  overrun?: number;
  /** Movement ratings for the unit. */
  movement: MovementProfile;
  /** Required for armoured types (tank, tank-destroyer, assault-gun, sp-artillery, sp-anti-aircraft). */
  armor?: ArmorProfile<ArmorFacingGame>;
  /** Required when `armor` is absent (units without an armour profile). */
  casualtiesThreshold?: number;
  /** Optional resource costs keyed by ResourcePool.key. */
  resourceCosts?: Record<string, number>;
  /** Optional weapon assignments resolved against the weapon catalogue. */
  weapons?: UnitWeapon[];
  /** Optional rule keywords (e.g. 'low-reliability', 'radio'). */
  keywords?: UnitKeyword[];
}

/** A vehicle catalogue entry, e.g. `src/data/vehicles/german/panzer-iv-ausf-g.json`. */
export interface VehicleCatalogueEntry extends CatalogueEntryMeta {
  type: VehicleType;
  historical: VehicleHistoricalProfile;
  game: VehicleGameProfile;
}
