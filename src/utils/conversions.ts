/**
 * Transformation helpers between historical real-world reference values and their
 * in-game representation.
 *
 * These are first-draft formulas: the game rules are still in design, so the resulting
 * values are a starting point for content authors rather than an enforced constraint.
 */

import type {
  ArmorFacingGame,
  ArmorFacingHistorical,
  ArmorProfile,
  MovementProfile,
} from '../types/catalogue';
import type { VehicleCatalogueEntry, VehicleGameProfile } from '../types/vehicle';

/** Fraction of historical road speed (km/h) applied at each movement pace. */
export const SPEED_PACE_SCALE = {
  tactical: 0.45,
  cruise: 0.8,
  dash: 1,
} as const;

export type MovementPace = keyof typeof SPEED_PACE_SCALE;

/** Converts a historical speed in km/h into a game movement value (inches/turn) for a pace. */
export function speedKmhToGameInches(kmh: number, pace: MovementPace): number {
  return Math.round(kmh * SPEED_PACE_SCALE[pace]);
}

/** Terrain fractions applied after deriving movement from historical road speed. */
export const TERRAIN_MOVEMENT_SCALE = {
  road: 1,
  crossCountry: 0.75,
  rough: 0.375,
} as const;

/** Converts historical road speed into a complete in-game movement profile. */
export function speedKmhToGameMovement(speedKmh: number): MovementProfile {
  return {
    tactical: {
      road: speedKmhToGameInches(speedKmh, 'tactical'),
      crossCountry: Math.round(speedKmhToGameInches(speedKmh, 'tactical') * TERRAIN_MOVEMENT_SCALE.crossCountry),
      rough: Math.round(speedKmhToGameInches(speedKmh, 'tactical') * TERRAIN_MOVEMENT_SCALE.rough),
    },
    cruise: {
      road: speedKmhToGameInches(speedKmh, 'cruise'),
      crossCountry: Math.round(speedKmhToGameInches(speedKmh, 'cruise') * TERRAIN_MOVEMENT_SCALE.crossCountry),
      rough: Math.round(speedKmhToGameInches(speedKmh, 'cruise') * TERRAIN_MOVEMENT_SCALE.rough),
    },
    dash: {
      road: speedKmhToGameInches(speedKmh, 'dash'),
      crossCountry: Math.round(speedKmhToGameInches(speedKmh, 'dash') * TERRAIN_MOVEMENT_SCALE.crossCountry),
      rough: Math.round(speedKmhToGameInches(speedKmh, 'dash') * TERRAIN_MOVEMENT_SCALE.rough),
    },
  };
}

/**
 * Effective armour thickness accounting for plate slope (simple secant law).
 * Returns an integer value (rounded).
 */
export function effectiveArmorThicknessMM(thicknessMM: number, inclinationDeg: number): number {
  const radians = (inclinationDeg * Math.PI) / 180;
  const effective = thicknessMM / Math.cos(radians);
  const inCm = effective / 10; // convert mm to cm-equivalent game units
  return Math.round(inCm);
}

/** Converts a historical armour facing (thickness + inclination) into a game armour value. */
export function armorToGameValue(thicknessMM: number, inclinationDeg: number): number {
  return effectiveArmorThicknessMM(thicknessMM, inclinationDeg);
}

/** Converts a complete historical armour profile into game-facing armour values. */
export function armorProfileToGameValues(
  armor: ArmorProfile<ArmorFacingHistorical>,
  existingArmor?: ArmorProfile<ArmorFacingGame>,
): ArmorProfile<ArmorFacingGame> {
  return {
    front: armorFacingToGameValue(armor.front, existingArmor?.front),
    side: armorFacingToGameValue(armor.side, existingArmor?.side),
    rear: armorFacingToGameValue(armor.rear, existingArmor?.rear),
    exposed: armorFacingToGameValue(armor.exposed, existingArmor?.exposed),
  };
}

/** Recalculates derived game fields from historical data while preserving manual game data. */
export function updateGameDataFromHistorical(entry: VehicleCatalogueEntry): VehicleCatalogueEntry {
  const game: VehicleGameProfile = { ...entry.game };

  if (entry.historical.speedKmh) {
    game.movement = speedKmhToGameMovement(entry.historical.speedKmh.road);
  }

  if (entry.historical.armor) {
    game.armor = armorProfileToGameValues(entry.historical.armor, entry.game.armor);
  }

  return {
    ...entry,
    game,
  };
}

function armorFacingToGameValue(
  facing: ArmorFacingHistorical,
  existingFacing?: ArmorFacingGame,
): ArmorFacingGame {
  return {
    value: armorToGameValue(facing.thicknessMM, facing.inclinationDeg),
    ...(existingFacing?.notes ? { notes: existingFacing.notes } : {}),
  };
}

/** Converts a historical armour penetration figure (mm) into a game `armourPenetration` value. */
export function armorPenetrationToGameValue(penetrationMM: number): number {
  return Math.round(penetrationMM / 10);
}

/** Best ("good") ballistic quality, expressed as a "hit on X+" target on a d6. */
export const BALLISTIC_HIT_ON_BEST = 2;
/** Worst ("very bad") ballistic quality, expressed as a "hit on X+" target on a d6. */
export const BALLISTIC_HIT_ON_WORST = 6;

/**
 * Converts a historical hit-probability percentage into a game `hitOn` value (a d6 "X+" target),
 * picking the X in [BALLISTIC_HIT_ON_BEST, BALLISTIC_HIT_ON_WORST] whose hit chance ((7 - X) / 6)
 * is closest to the historical probability.
 */
export function hitProbabilityToHitOn(probabilityPercent: number): number {
  let bestHitOn = BALLISTIC_HIT_ON_BEST;
  let smallestDiff = Infinity;
  for (let hitOn = BALLISTIC_HIT_ON_BEST; hitOn <= BALLISTIC_HIT_ON_WORST; hitOn += 1) {
    const targetPercent = ((7 - hitOn) / 6) * 100;
    const diff = Math.abs(probabilityPercent - targetPercent);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      bestHitOn = hitOn;
    }
  }
  return bestHitOn;
}
