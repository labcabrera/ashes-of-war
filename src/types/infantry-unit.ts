/**
 * Infantry unit catalogue entry types for the per-file content structure described in
 * AGENT.md. Pairs real-world organizational reference data with the corresponding game
 * profile.
 */

import type { CatalogueEntryMeta, MovementProfile } from './catalogue';
import type { UnitKeyword, UnitWeapon } from './unit';

/** Real-world reference data for an infantry unit. */
export interface InfantryHistoricalProfile {
  /** Reference to the historical organization this entry represents (e.g. a TO&E). */
  organizationReference?: string;
  /** Historical headcount of the represented formation. */
  members: number;
  /** Free-text references to the small arms historically issued (e.g. "1x MG34, 7x Kar98k"). */
  smallArms?: string[];
  sourceUrl?: string;
  notes?: string;
}

/** In-game profile for an infantry unit. */
export interface InfantryGameProfile {
  /** Point cost. */
  cost: number;
  /** Organization loss threshold used by morale and disruption rules. */
  organizationThreshold: number;
  /** Number of individual combatants represented by this unit. */
  combatants: number;
  /** Casualties threshold before the unit is considered destroyed. */
  casualtiesThreshold: number;
  /** Movement ratings for the unit. */
  movement: MovementProfile;
  /** Optional resource costs keyed by ResourcePool.key. */
  resourceCosts?: Record<string, number>;
  /** Optional weapon assignments resolved against the weapon catalogue. */
  weapons?: UnitWeapon[];
  /** Optional rule keywords (e.g. 'low-reliability', 'radio'). */
  keywords?: UnitKeyword[];
}

/** An infantry unit catalogue entry, e.g. `src/data/infantry-units/german/panzergrenadier-squad-1944.json`. */
export interface InfantryUnitCatalogueEntry extends CatalogueEntryMeta {
  type: 'infantry';
  historical: InfantryHistoricalProfile;
  game: InfantryGameProfile;
}
