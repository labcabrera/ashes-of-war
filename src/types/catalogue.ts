/**
 * Shared building blocks for the per-file content catalogue (vehicles, infantry units,
 * weapons) described in AGENT.md. Each catalogue entry pairs real historical reference
 * data with the corresponding game data and is reviewed independently.
 */

import type { FactionId } from './faction';

/** Fields shared by every new-style catalogue entry (vehicle, infantry unit, weapon). */
export interface CatalogueEntryMeta {
  id: string;
  name: string;
  faction: FactionId;
  /** First year (inclusive) this entry is historically relevant. */
  from: number;
  /** Last year (inclusive); use 9999 for open-ended. */
  to: number;
  /** ISO date (YYYY-MM-DD) of the last content review/validation. */
  reviewedAt: string;
  /** Optional public image shown as the visual detail avatar. */
  imageUrl?: string;
}

/** Real-world armour facing: plate thickness and inclination. */
export interface ArmorFacingHistorical {
  thicknessMM: number;
  inclinationDeg: number;
  notes?: string;
}

/** Game-facing armour rating used by combat resolution. */
export interface ArmorFacingGame {
  value: number;
  notes?: string;
}

/** Armour ratings for the four standard facings: front, side, rear, and exposed. */
export interface ArmorProfile<T> {
  front: T;
  side: T;
  rear: T;
  exposed: T;
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
