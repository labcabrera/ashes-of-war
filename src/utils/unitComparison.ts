/**
 * Helpers for grouping units that can be compared in the catalogue.
 */
import type { Unit, UnitType } from '../types/unit';

export type UnitComparisonCategory = 'infantry' | 'vehicle' | 'towed' | 'aircraft';

const TOWED_TYPES: UnitType[] = ['towed-artillery', 'towed-anti-tank', 'towed-anti-aircraft'];

export function unitComparisonCategory(unit: Unit): UnitComparisonCategory {
  if (unit.type === 'infantry') return 'infantry';
  if (unit.type === 'aircraft') return 'aircraft';
  if (TOWED_TYPES.includes(unit.type)) return 'towed';
  return 'vehicle';
}

export function areComparableUnits(left: Unit, right: Unit): boolean {
  return unitComparisonCategory(left) === unitComparisonCategory(right);
}

export function comparableUnits(unit: Unit, units: Unit[]): Unit[] {
  return units
    .filter((candidate) => candidate.id !== unit.id && areComparableUnits(unit, candidate))
    .sort((a, b) => a.name.localeCompare(b.name));
}
