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
  return (thicknessMM / Math.cos((inclinationDeg * Math.PI) / 180)) / 10;
}

/** Converts a historical armour facing (thickness + inclination) into a game armour value. */
export function armorToGameValue(thicknessMM: number, inclinationDeg: number): number {
  return Math.round(effectiveArmorThicknessMM(thicknessMM, inclinationDeg));
}
