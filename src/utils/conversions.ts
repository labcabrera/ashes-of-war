/**
 * Transformation helpers between historical real-world reference values and their
 * in-game representation.
 *
 * These are first-draft formulas: the game rules are still in design, so the resulting
 * values are a starting point for content authors rather than an enforced constraint.
 */

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

/** Effective armour thickness accounting for plate slope (simple secant law). */
export function effectiveArmorThicknessMM(thicknessMM: number, inclinationDeg: number): number {
  return thicknessMM / Math.cos((inclinationDeg * Math.PI) / 180);
}

/** Converts a historical armour facing (thickness + inclination) into a game armour value. */
export function armorToGameValue(thicknessMM: number, inclinationDeg: number): number {
  return Math.round(effectiveArmorThicknessMM(thicknessMM, inclinationDeg));
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
